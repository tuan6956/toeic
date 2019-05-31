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

function getAll(req, res){
  let level = req.swagger.params.level.value;
  let page = req.swagger.params.page.value;
  let limit = req.swagger.params.limit.value;

  req.app.models.testModels.getAll(level, page, limit)
    .then(result => {
        handleSuccess(res, 200, result);
      })
    .catch(error => {
      handleError(res, error.status, error.message);
    });

}

function getResultTest(req, res){

  let correct_listening = _.get(req.body, 'correct_listening');
  let correct_reading = _.get(req.body, 'correct_reading');
  let test_id = _.get(req.body, 'test_id');
  let user_id = _.get(req.body, 'user_id');

  let result = req.app.models.testModels.getResultTest(correct_listening, correct_reading, test_id, user_id)
  result.then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function getResultMiniTest(req, res){

  let correct_listening = _.get(req.body, 'correct_listening');
  let correct_reading = _.get(req.body, 'correct_reading');
  let test_id = _.get(req.body, 'test_id');
  let user_id = _.get(req.body, 'user_id');

  let result = req.app.models.testModels.getResultMiniTest(correct_listening, correct_reading, test_id, user_id)
  result.then(result => {
      // res.redirect('http://'+ req.headers.host +'/api/miniTest?listening='+ result.result.listening_scores +'&reading='+result.result.reading_scores+'&total='+result.result.total)
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

function getTheTestById(req, res){
  let testId = req.swagger.params.testId.value;

    req.app.models.testModels.getTheTestById(testId)
    .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

function requestGenerateMiniTest(req, res){
  // let level = _.get(req.body, 'level');
  // if(!level || level < 0 || level > 4){
  //   handleError(res, 500, "level is greater than 0 and smaller then 5");
  // }
    req.app.models.testModels.generateMiniTest()
    
    handleSuccess(res, 200, "success");
}

function getAllMiniTest(req, res){
   // let level = req.swagger.params.level.value;
  let page = req.swagger.params.page.value;
  let limit = req.swagger.params.limit.value;

  req.app.models.testModels.getAllMiniTest(page, limit)
    .then(result => {
        handleSuccess(res, 200, result);
      })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

function getMiniTestById(req, res){
  let testId = req.swagger.params.testId.value;

    req.app.models.testModels.getMiniTestById(testId)
    .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

function getAllTestForApp(req, res){
  let level = req.swagger.params.level.value;
  let page = req.swagger.params.page.value;
  let limit = req.swagger.params.limit.value;

  req.app.models.testModels.getAllTestForApp(level, page, limit)
    .then(result => {
        handleSuccess(res, 200, result);
      })
    .catch(error => {
      handleError(res, error.status, error.message);
    });

}

module.exports = {
    getTheTestByLevelAndOrdinalTest: getTheTestByLevelAndOrdinalTest,
    getMiniTest: getMiniTest,
    getAll: getAll,
    getResultTest,
    getTheTestById,
    getResultMiniTest,
    requestGenerateMiniTest,
    getAllMiniTest,
    getMiniTestById,
    getAllTestForApp
}