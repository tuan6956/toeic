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
        handleError(res, 500, error.message);
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

let getResultTest = async (req, res)=>{

  let correct_listening = _.get(req.body, 'correct_listening');
  let correct_reading = _.get(req.body, 'correct_reading');
  let test_id = _.get(req.body, 'test_id');

  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();

  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }

  let result = req.app.models.testModels.getResultTest(correct_listening, correct_reading, test_id, id_user[0]._id)
  result.then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

let getResultMiniTest = async (req, res) => {

  let correct_listening = _.get(req.body, 'correct_listening');
  let correct_reading = _.get(req.body, 'correct_reading');
  let test_id = _.get(req.body, 'test_id');
  let isCheckOriginal = _.get(req.body, 'isCheckOriginal');

  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();

  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }

  let result = req.app.models.testModels.getResultMiniTest(correct_listening, correct_reading, test_id, id_user[0]._id, req.email, isCheckOriginal)
  result.then(result => {
    handleSuccess(res, 200, result);
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

let getResultPracticeSkillFollowPart = async (req, res) => {

  let test_id = _.get(req.body, 'test_id');
  let quantity_correct_answers = _.get(req.body, 'quantity_correct_answers');
  let total = _.get(req.body, 'total');
  let part = _.get(req.body, 'part');

  if(quantity_correct_answers > total){
    handleError(res, 500, "quantity_correct_answers can not greater than total")
  }

  let result_practices = quantity_correct_answers.toString() + '/'+ total.toString();

  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();

  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }

  let result = req.app.models.testModels.getResultPracticeSkillFollowPart(result_practices, test_id, id_user[0]._id, part)
  result.then(result => {
    handleSuccess(res, 200, {result: result.result, message: result.message});
  })
  .catch(error => {
    handleError(res, error.status, error.message);
  });
}

let getTheTestById = async(req, res) =>{
  let testId = req.swagger.params.testId.value;
  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();
  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }


    req.app.models.testModels.getTheTestById(testId, id_user[0]._id)
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

  let getAllMiniTestForApp = async(req, res) => {
   // let level = req.swagger.params.level.value;
  let page = req.swagger.params.page.value;
  let limit = req.swagger.params.limit.value;

  let is_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();

  req.app.models.testModels.getAllMiniTestForApp( is_user[0]._id, page, limit)
    .then(result => {
        handleSuccess(res, 200, result);
      })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

let getMiniTestById = async(req, res) => {
  let testId = req.swagger.params.testId.value;

  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();
  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }

    req.app.models.testModels.getMiniTestById(testId, id_user[0]._id)
    .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

let getAllTestForApp = async(req, res) =>{
  let level = req.swagger.params.level.value;
  let page = req.swagger.params.page.value;
  let limit = req.swagger.params.limit.value;

  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();
  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }

  req.app.models.testModels.getAllTestForApp( id_user[0]._id,level, page, limit)
    .then(result => {
        handleSuccess(res, 200, result);
      })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

let getAllPractiseTestSkills = async (req, res) => {

  let part = req.swagger.params.part.value;

  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();


  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }
  req.app.models.testModels.getAllPractiseTestSkills(part, id_user[0]._id)
    .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

let getAllPractiseTestSkillsById = async(req, res)=>{
  let part = req.swagger.params.part.value;
  let Id = req.swagger.params.Id.value;
    let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();
  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }
  
  req.app.models.testModels.getAllPractiseTestSkillsById(part, Id, id_user[0]._id)
    .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

let getPredictScores = async(req, res)=>{
  
  // let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();
  // if (!id_user[0]) {
  //   handleError(res, 500, "email is not exist, please check your session login")
  // }
  
  req.app.models.testModels.getPredictScores('id_user[0]._id')
    .then(result => {
      console.log(result)
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      });
}

let getAnalysisUserSkill = async(req, res) =>{
  let id_user = await req.app.models.app.db.collection('User').find({email: req.email}).toArray();
  if (!id_user[0]) {
    handleError(res, 500, "email is not exist, please check your session login")
  }


    req.app.models.testModels.getAnalysisUserSkill(id_user[0]._id)
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
    getAllMiniTestForApp,
    getMiniTestById,
    getAllTestForApp,
    getAllPractiseTestSkills,
    getAllPractiseTestSkillsById,
    getResultPracticeSkillFollowPart,
    getPredictScores,
    getAnalysisUserSkill
}