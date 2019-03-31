"use strict";

var util = require("util");
var _ = require('lodash');
const { questionOfPart7Model } = require('../../models/index');
const { handleSuccess, handleError } = require('../../middlewares/request');

function importQuestion(req, res){
  let question_content = _.get(req.body, "question_content");
  let answers = _.get(req.body, "answers");
  let right_answer = _.get(req.body, "right_answer");
  let explain = _.get(req.body, "explain");
  let level = _.get(req.body, "level");
  let part = _.get(req.body, "part");
  let id_paragraph = _.get(req.body, "id_paragraph");

  let data = {
    question_content: question_content,
    answers: answers,
    right_answer: right_answer,
    explain: explain,
    level: level,
    part: part,
    id_paragraph: id_paragraph
  }

  questionOfPart7Model.importQuestionsPart7(data)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

module.exports = {
  importQuestion: importQuestion,
  };