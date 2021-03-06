'use strict';

var util = require('util');
const config = require('./config')
const lessonRepo = require('../../repository/lessonRepo')
const topicRepo = require('../../repository/topicRepo')
const categoryRepo = require('../../repository/categoryRepo')


var ObjectId = require('mongodb').ObjectID;

module.exports = {
  getAll: get,
  add: add,
  update: update,
  getOne: getOne,
  deleteCategory: deleteCategory,
};

function get(req, res) {
  var limit = 10;
  var page = 0;
  var params = req.swagger.params;

  if(params.page) {
    page =  params.page.value;
  }
  if(params.limit) {
    limit = params.limit.value;
  }

  categoryRepo.getAll(limit, page).then( value => {
    //console.log(util.inspect(value, {showHidden: false, depth: null}))
    if(!value)
      value = [];
    res.status(200);
    res.json({success: true, value: {categories: value } });
  }).catch( err => {
    console.log(err.err);
    res.status(400);
    res.json({success: false, message: err.err });
  });
}

function getOne(req, res) {
  var categoryId = req.swagger.params.categoryId.value.trim();
  //middleware
  // if(lessonId.length !== 24) {
  //   res.status(200);
  //   res.json({success: false, message: "lessonId not found"});
  // }
  categoryRepo.findOne({"_id": new ObjectId(categoryId)}).then( value => {
    var success = true;
    var mess = "";
    var statusCode = 200;
    if(!value){
      success = false;
      value = {};
      mess = "category not found";
      statusCode = 400;

    }
    res.status(statusCode);
    res.json({success: success, message: mess, value: value});
  }).catch( err => {
    res.status(400);
    res.json({success: false, message: err.err });
  });
}

function add(req, res) {

  var body = req.swagger.params.body.value;
  var name = body.name;
  var data = {
    name: name,
    topics: []
  }
  categoryRepo.insert(data).then( value => {
    res.status(200);
    res.json({success: true, value: data});
  }).catch( err => {
    res.status(400);
    res.json({success: false, message: err.err });
  });
}

function update(req, res) {

  var categoryId = req.swagger.params.categoryId.value;
  var body = req.swagger.params.body.value;
  var name = body.name;
  var query = {"_id": new ObjectId(categoryId)};
  
  categoryRepo.update(query, {$set: {name: name}}).then(value => {
      var success = true;
      var mess = "";
      if(value.result.n === 0){
          success = false;
          mess = "not found topicId or nothing update";
      }
      res.status(200);
      res.json({
          success: success,
          message: mess
      });
  }).catch( err => {
      res.status(400);
      res.json({
          success: false,
          message: err.err
      });
  });
}

function deleteCategory(req, res) {
  return;
}