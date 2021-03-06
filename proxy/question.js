var models = require('../models');
var Question = models.Question;
var Topic = models.Topic;
var eventproxy = require('eventproxy');

exports.newQuestionSave = function (author_id, title, description, tags, callback) {
  var question = new Question();
  question.author_id = author_id;
  question.title = title;
  question.description = description;
  question.tags = tags;
  question.save(callback);
};

exports.findQuestionById = function (question_id, callback) {
  Question.findByIdAndUpdate(question_id, { $inc:{ pv: 1 }}, callback);
};

// 话题查询时不加pv
var findQuestionNoPvById = exports.findQuestionNoPvById = function (question_id, callback) {
  Question.findById(question_id).exec(callback);
};

exports.findQuestionByTopic = function (topic, callback) {
  var ep = new eventproxy();
  topic.forEach(function (question) {
    findQuestionNoPvById(question.question_id, ep.done('find_question'));    
  });
  ep.after('find_question', topic.length, function (questions) {
    callback(null, questions);
  });
};

// 用户发布的问题的数量
exports.findAllQuestionsByUserId = function (user_id, callback) {
  Question.count({ 'author_id': user_id }, callback);
}

// 用户发布的所有问题
exports.findQuestionsByUserId = function (user_id, callback) {
  Question.find({ 'author_id': user_id }, null, { sort: '-pv' }, callback);
}


// 查询话题相关问题
exports.findRelatedQuestions = function (tags, question_id, callback) {
  Question
    .where('tags').in(tags)
    .where('_id').ne([question_id])
    .limit(5)
    .sort('-create_at')
    .exec(callback);
};

exports.search =  function (search, callback) {
  var reg = new RegExp(search, 'i');
  Question.find({ title: reg }, callback);
};

exports.focusOnQuestion = function (user_id, question_id, callback) {
  Question.findByIdAndUpdate(question_id, { $push:{ focus_id: user_id }}, callback);
}
exports.unfocusOnQuestion = function (user_id, question_id, callback) {
  Question.findByIdAndUpdate(question_id, { $pull:{ focus_id: user_id }}, callback);
}


exports.findIfHasFocus = function (user_id, qusetion_id, callback) {
  Question
    .find({ _id: qusetion_id })
    .where('focus_id').in([user_id])
    .exec(callback);
};