"use strict";

var util = require("util");
var _ = require('lodash');
const { listeningModel } = require('../../models/index');
const { handleSuccess, handleError } = require('../../middlewares/request');

function importQuestion(req, res){

  listeningModel.importQuestion(req.body)
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