"use strict";

var util = require("util");
var _ = require('lodash');
const { blankQuestionModel, 
        blankParagraphModel, 
        listAnswerOfPart6Model, 
        paragraphPart7Model,
        questionOfPart7Model
      } = require('../../models/index');
const { handleSuccess, handleError } = require('../../utils/request');
const { checkAccessToken } = require('../../utils/jwt');
const { verifyToken } = require('../../utils/auth');


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

  blankQuestionModel.importBlankQuestion(data)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function importParagraphQuestionPart6(req, res){
  let blank_paragraph = _.get(req.body, 'blank_paragraph');
  let list_options = _.get(req.body, 'list_options');
  let list_right_answers = _.get(req.body, 'list_right_answers');
  let list_explains = _.get(req.body, "list_explains");
  let level = _.get(req.body, 'level');
  let part = _.get(req.body, 'part');

  let list_position = [];

  blank_paragraph = blank_paragraph.replace(/[_]/g,'')

  for(let i = 0; i < blank_paragraph.length; i ++){
    if(blank_paragraph[i] === " " && blank_paragraph[i+1]===" "){
      list_position.push(i);
      i=i+1;
    }
  }

  let paragraph_data = {
    blank_paragraph: blank_paragraph,
    list_options: list_options,
    list_right_answers: list_right_answers,
    list_position: list_position,
    list_explains: list_explains,
    level: level,
    part: part
  }

  blankParagraphModel.importBlankParagraph(paragraph_data)
    .then(result => {
      console.log(result)
      handleSuccess(res, 200, result);
    })
    .catch(err =>{
      handleError(res, err.status, err.message);
    })
}

function importParagraphPart7(req, res){
  let paragraphs = _.get(req.body, 'paragraphs');
  let level = _.get(req.body, "level");
  let part = _.get(req.body, "part");

  let data = {
    paragraphs: paragraphs,
    level: level,
    part: part
  }

  paragraphPart7Model.importParagraphPart7(data)
  .then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function importQuestionsPart7(req, res){
  let question_content = _.get(req.body, "question_content");
  let answers = _.get(req.body, "answers");
  let right_answer = _.get(req.body, "right_answer");
  let explain = _.get(req.body, "explain");
  let level = _.get(req.body, "level");
  let part = _.get(req.body, "part");
  let id_paragraph = _.get(req.body, "id_paragraph");

  let data = {
    question_content: question_content.replace(/[_]/g,''),
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
  importBlankQuestion: importBlankQuestion,
  importParagraphQuestionPart6: importParagraphQuestionPart6,
  importParagraphPart7: importParagraphPart7,
  importQuestionsPart7: importQuestionsPart7,
  };