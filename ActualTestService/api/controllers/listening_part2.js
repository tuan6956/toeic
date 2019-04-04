"use strict";

var util = require("util");
var _ = require('lodash');
const { listeningPart2Model } = require('../../models/index');
const { handleSuccess, handleError } = require('../../middlewares/request');

function importQuestion(req, res){

  let audio_link = _.get(req.body, "audio_link");
  let answers = _.get(req.body, "answers");
  let right_answer = _.get(req.body, "right_answer");
  let explain = _.get(req.body, "explain");
  let level = _.get(req.body, "level");
  let part = _.get(req.body, "part");

  let data = {
    audio_link: audio_link,
    answers: answers,
    right_answer: right_answer,
    explain: explain,
    level: level,
    part: part
  }

  listeningPart2Model.importQuestion(data)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function getAll(req, res){
  let page = _.get(req.body, 'page');
  let limit = _.get(req.body, 'limit')

  listeningPart2Model.getAll(page, limit)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

function getQuestionById(req, res){
  let questionId = req.swagger.params.questionId.value.trim();

  listeningPart2Model.getQuestionById(questionId)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });

}

function updateQuestion(req, res){
  let data = req.body;
  let _id = req.swagger.params.questionId.value.trim()

  listeningPart2Model.updateQuestionById(_id, data)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

module.exports = {
    importQuestion: importQuestion,
    getAll: getAll,
    getQuestionById,
    updateQuestion
  };