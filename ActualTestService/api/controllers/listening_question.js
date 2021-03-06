"use strict";

var util = require("util");
var _ = require('lodash');
// const { listeningModel } = require('../../models/index');
import Models from '../../models/index';
const { handleSuccess, handleError } = require('../../middlewares/request');

function importQuestion(req, res){

  let level = _.get(req.body, 'level');

  req.app.models.listeningModels.importQuestion(req.body)
  .then(result => {
    req.app.models.testModels.generateTestToLevel(level);
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function getAll(req, res){
  let page = _.get(req.swagger.params, 'page');
  let limit = _.get(req.swagger.params, 'limit')
  let part = _.get(req.swagger.params, 'part')

  req.app.models.listeningModels.getAll(page.value, limit.value, part.value)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

function getQuestionById(req, res){
  let questionId = req.swagger.params.questionId.value.trim();

  req.app.models.listeningModels.getQuestionById(questionId)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });

}

function updateQuestion(req, res){
  let data = req.body;
  let _id = req.swagger.params.questionId.value.trim();

  req.app.models.listeningModels.updateQuestionById(_id, data)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function deleteQuestion(req, res){
  // req.app.models.listeningModels.updateQuestionById(_id, data)
  // .then(result => {
    handleSuccess(res, 200, result);
  // })
  // .catch(error => {
  //   handleError(res, error.status, error.message);
  // });
}

function getDialogueById(req, res){
  let questionId = req.swagger.params.questionId.value.trim();

  req.app.models.listeningModels.getDialogueById(questionId)
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
    updateQuestion,
    deleteQuestion,
    getDialogueById
  };