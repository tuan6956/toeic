"use strict";

var util = require("util");
var _ = require('lodash');
const { paragraphPart7Model } = require('../../models/index');
const { handleSuccess, handleError } = require('../../middlewares/request');

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

module.exports = {
  importParagraph: importParagraphPart7,
  };