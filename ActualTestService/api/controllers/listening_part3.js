"use strict";

var util = require("util");
var _ = require('lodash');
const { listeningPar1Model } = require('../../models/index');
const { handleSuccess, handleError } = require('../../middlewares/request');

function importQuestion(req, res){

  let image_link = _.get(req.body, "image_link");
  let answers = _.get(req.body, "answers");
  let right_answer = _.get(req.body, "right_answer");
  let explain = _.get(req.body, "explain");
  let level = _.get(req.body, "level");
  let part = _.get(req.body, "part");

  let data = {
    image_link: image_link,
    answers: answers,
    right_answer: right_answer,
    explain: explain,
    level: level,
    part: part
  }

  listeningPar1Model.importQuestion(data)
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

  listeningPar1Model.getAll(page, limit)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

function getQuestionById(req, res){
  let questionId = req.swagger.params.questionId.value.trim();

  listeningPar1Model.getQuestionById(questionId)
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

  listeningPar1Model.updateQuestionById(_id, data)
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