"use strict";

var util = require("util");
var _ = require('lodash');
import Models from '../../models/index';
const { handleSuccess, handleError } = require('../../middlewares/request');

function getTheTestByLevelAndOrdinalTest(req, res){
  
    let level = req.swagger.params.level.value;
    let ordinalOfTest = req.swagger.params.ordinalOfTest.value;

    req.app.models.testModels.getTheTestByLevelAndOrdinalTest(level, ordinalOfTest)
    .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

function getMiniTest(req, res){
  
    // let level = req.swagger.params.level.value;
    // let ordinalOfTest = req.swagger.params.ordinalOfTest.value;

    req.app.models.testModels.getMiniTest()
    .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

module.exports = {
    getTheTestByLevelAndOrdinalTest: getTheTestByLevelAndOrdinalTest,
    getMiniTest: getMiniTest
}