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
  console.log(req.body)
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

module.exports = {
    importQuestion: importQuestion,
    getAll: getAll
  };