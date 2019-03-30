"use strict";

var util = require("util");
const { adminModel } = require('../../models/index');
const {
    handleSuccess,
  handleError
} = require('../../utils/request');

const {
    checkAccessToken,
} = require('../../utils/jwt');

const {
    generateToken,
  verifyToken
} = require('../../utils/auth');


const md5 = require('md5')
var ObjectId = require('mongodb').ObjectID;
const request = require('request');


//db.createIndex({email:1},{unique:true});
//Singin user
function signin(req, res) {
  var body = req.swagger.params.body;
  var email = body.value.email;
  var password = body.value.password;
  if (email === "") {
    handleError(res, 401, 'Missing email number');
    return;
  }
  if (password === "") {
    handleError(res, 401, 'Missing password');
    return;
  }
  adminModel.login(body.value)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    })
}

//Sign up user
function signup(req, res) {

  var body = req.swagger.params.body;
  var email = body.value.email;
  var password = body.value.password;
  // var rePassword = body.value.rePassword;
  // var email = body.value.email;
  var name = body.value.name;

  if (email === "") {
    handleError(res, 401, 'Missing email number');
    return;
  }
  if (password === "") {
    handleError(res, 401, 'Missing password');
    return;
  }
  // if (password !== rePassword) {
  //   handleError(res, 401, 'password and Re-enter password not match');
  //   return;
  // }
  // if (email === "") {
  //   handleError(res, 401, 'Missing email');
  //   return;
  // }
  if (name === "") {
    handleError(res, 401, 'Missing name');
    return;
  }
  adminModel.register(body.value)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}


module.exports = {
  adminSignin: signin,
  adminSignup: signup, 
};