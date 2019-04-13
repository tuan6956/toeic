"use strict";

var util = require("util");
var _ = require('lodash');
const { readingQuestionModel } = require('../../models/index');
const { handleSuccess, handleError } = require('../../middlewares/request');

function importBlankQuestion(req, res){

  let question_content = _.get(req.body, "question_content");
  let answers = _.get(req.body, "answers");
  let right_answer = _.get(req.body, "right_answer");
  let explain = _.get(req.body, "explain");
  let level = _.get(req.body, "level");
  let part = _.get(req.body, "part");

  if(question_content.indexOf('__') === -1){
    ///maybe blank not exist
    handleError(res, 412, 'Blank is not exits, please check again');
  }
  let pos = question_content.indexOf('__');

  let data = {
    question_content: question_content.replace(/[_]/g,''),
    pos: pos,
    answers: answers,
    right_answer: right_answer,
    explain: explain,
    level: level,
    part: part
  }

  readingQuestionModel.importQuestion(data)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function getAll(req, res){
  console.log(req.body)
  let page = _.get(req.body, 'page');
  let limit = _.get(req.body, 'limit')

  readingQuestionModel.getAll(page, limit)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

module.exports = {
  importBlankQuestion: importBlankQuestion,
  getAll: getAll
  };