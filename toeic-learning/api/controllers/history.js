'use strict';

var util = require('util');
const config = require('./config')
const historyRepo = require('../../repository/historyRepo')
const userRepo = require('../../repository/userRepo')
const lessonRepo = require('../../repository/lessonRepo')
var moment = require('moment');


var ObjectId = require('mongodb').ObjectID;
const arrayMilestons = [0, 100, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 990];

module.exports = {
    getHistory,
    updateStudiedLesson
};


function getHistory(req, res) {
    historyRepo.findOne({
        email: req.email
    }).then(value => {
        var success = true;
        var mess = "";
        var statusCode = 200;
        res.status(statusCode);
        res.json({
            success: success,
            message: mess,
            value: value
        });
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    });
}

function updateStudiedLesson(req, res) {

    var body = req.swagger.params.body.value;
    var lessonId = body.lessonId.trim();
    var type = body.type.trim();
    var isStudied = false;
    if (body.isStudied) {
        isStudied = true;
    }
    var now = moment().format('YYYY-MM-DD');
    historyRepo.findOne({
        email: req.email
    }).then(value => {
        if (value) {
            var history = value.history;

            var indexOfRoute = history.findIndex(his => {
                return his.date === now
            });
            if (indexOfRoute != -1) {
                var indexLesson = history[indexOfRoute].lessons.findIndex(lesson => {
                    return lesson._id.toString() === lessonId;
                })
                if (type == "lesson") {
                    history[indexOfRoute].lessons[indexLesson].lessonPassed = isStudied;
                } else if (type == "exercise") {
                    history[indexOfRoute].lessons[indexLesson].exercisePassed = isStudied;
                } else if (type == "minitest") {
                    history[indexOfRoute].lessons[indexLesson].passed = isStudied;
                }
                if (typeof history[indexOfRoute].progress === "undefined") {
                    history[indexOfRoute].progress = 1 / (history[indexOfRoute].lessons.length * 2);
                } else {
                    if(history[indexOfRoute].progress.toPrecision(2) < 1.0)
                        history[indexOfRoute].progress += (1 / (history[indexOfRoute].lessons.length * 2));
                }
                userRepo.findOne({
                    email: req.email
                }).then(user => {
                    var currentLevel = history[indexOfRoute].lessons[indexLesson].level;
                    if(user.level.current !== currentLevel) {
                        userRepo.update({email: req.email}, {$set: {'level.current': currentLevel}})
                    }
                    var indexTimeStudy = user.timeStudy.findIndex(date => {
                        return date === now;
                    })
                    if(indexTimeStudy != -1) {
                        history[indexOfRoute].timeStudy = user.timeStudy[indexTimeStudy].time;
                    } else {
                        history[indexOfRoute].timeStudy = 0;
                    }
                    historyRepo.update({
                        email: req.email,
                        'history.date': now
                    }, {
                        $set: {
                            'history.$.lessons': history[indexOfRoute].lessons,
                            'history.$.progress': history[indexOfRoute].progress,
                            'history.$.timeStudy': history[indexOfRoute].timeStudy,


                        }
                    })
                });

            }
        }
        var success = true;
        var mess = "Update successful";
        var statusCode = 200;
        res.status(statusCode);
        res.json({
            success: success,
            message: mess,
        });
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    });


}