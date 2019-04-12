"use strict";

var util = require("util");
var _ = require('lodash');
const { blankQuestionModel, 
        blankParagraphModel, 
        listAnswerOfPart6Model, 
        paragraphPart7Model,
        questionOfPart7Model
      } = require('../../models/index');
const { handleSuccess, handleError } = require('../../middlewares/request');

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

module.exports = {
  importParagraphQuestionPart6: importParagraphQuestionPart6,
  };