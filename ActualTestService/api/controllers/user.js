"use strict";

var util = require("util");
const { userModel } = require('../../models/index');
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
  userModel.login(body.value)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    })
}

function signinFB(req, res) {
  var body = req.swagger.params.body;
  var access_token = body.value.access_token;
  const options = {
    url: 'https://graph.facebook.com/v3.2/me',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
    },
    qs: {
      access_token: access_token,
      fields: 'email,first_name,last_name'
    }
  };
  request(options, function (err, resRQ, body) {
    let json = JSON.parse(body);
    var userId = json.id;
    var email = json.email;
    var fName = json.first_name;
    var lName = json.last_name;
    var info = {
      email: userId,
      name: lName + ' ' + fName,
    }
    if (!userId) {
      handleError(res, 401, json.error.message + " ( " + json.error.code + " )");
      return;
    }
    userModel.loginFacebook(info)
      .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      })
  });
}

function signinGoogle(req, res) {
  var body = req.swagger.params.body;
  var access_token = body.value.access_token;
  const options = {
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
    },
    qs: {
      access_token: access_token,
    }
  };
  request(options, function (err, resRQ, body) {
    let json = JSON.parse(body);
    var userId = json.id;
    var email = json.email;
    var fName = json.given_name;
    var lName = json.family_name;
    var info = {
      email: userId,
      name: lName + ' ' + fName,
    }
    if (!userId) {
      handleError(res, 401, json.error.message + " ( " + json.error.code + " )");
      return;
    }
    userModel.loginGoogle(info)
      .then(result => {
        handleSuccess(res, 200, result);
      })
      .catch(error => {
        handleError(res, error.status, error.message);
      })
  });
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
  userModel.register(body.value)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}

//update info user
function updateInfo(req, res) {

  var email = req.email;
  if (!email) {
    handleError(res, 403, 'access denied');
  }

  var body = req.swagger.params.body;
  var name = body.value.name
  var city = body.value.city
  var sex = body.value.sex
  var avatar = body.value.avatar
  var info = {
    name: name,
    city: city,
    sex: sex,
    avatar: avatar,
  }
  if (name == "") {
    handleError(res, 412, 'Missing name');
    return;
  }
  if (city == "") {
    handleError(res, 412, 'Missing city');
    return;
  }
  if (sex != 0 && sex != 1) {
    handleError(res, 412, 'Error type sex');
    return;
  }
  userModel.updateInfo(email, info)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });

}

//get info user
function getInfo(req, res) {

  var email = req.email;
  if (!email) {
    handleError(res, 403, 'access denied');
  }
  userModel.getInfo(email)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });


}


function changePassword(req, res) {
  var email = req.email;
  if (!email) {
    handleError(res, 403, 'access denied');
  }
  var body = req.swagger.params.body;
  var oldPassword = body.value.oldPassword
  var newPassword = body.value.newPassword
  var reNewPassword = body.value.reNewPassword
  if (oldPassword == "") {
    handleError(res, 412, 'Missing Old Password');
    return;
  }
  if (newPassword == "") {
    handleError(res, 412, 'Missing New Password');
    return;
  }
  if (reNewPassword == "") {
    handleError(res, 412, 'Error ReNewPassword');
    return;
  }
  if (newPassword !== reNewPassword) {
    handleError(res, 412, 'New and Renew password are not the same');
    return;
  }
  if (reNewPassword === oldPassword) {
    handleError(res, 412, 'Old and New password are not the same');
    return;
  }
  var info = {
    email: email,
    oldPassword: oldPassword,
    newPassword: newPassword,
    reNewPassword: reNewPassword
  }
  userModel.changePassword(info)
    .then(result => {
      handleSuccess(res, 200, result);
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });

}

function userMe(req, res) {

  var email = req.email;
  if (!email) {
    handleError(res, 403, 'access denied');
  }
  userModel.getInfo(email)
    .then(result => {
      handleSuccess(res, 200, { email: result.info.email });
    })
    .catch(error => {
      handleError(res, error.status, error.message);
    });
}


module.exports = {
  signin: signin,
  signup: signup,
  updateInfo: updateInfo,
  getInfo: getInfo,
  signinFB: signinFB,
  signinGoogle: signinGoogle,
  changePassword: changePassword,
  userMe: userMe
};