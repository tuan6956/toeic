'use strict';

var util = require('util');
const config = require('./config')
const milestoneRepo = require('../../repository/milestoneRepo')
const categoryRepo = require('../../repository/categoryRepo')
const lessonRepo = require('../../repository/lessonRepo')


var ObjectId = require('mongodb').ObjectID;
const arrayMilestons = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950];
module.exports = {
    getRoute: calcTimeStudy
};



function calcTimeStudy(req, res) {

    // var indexLevel = Math.round(level/50);
    // var indexTarget = Math.round(target/50);
    var indexLevel = Math.round(0/50);
    var indexTarget = Math.round(550/50);
    var hoursPerDay = 2;
    var dateStart = '2019-05-30';
    var dateEnd = '2019-06-30';
    var inQueryLevel = Array.from({length: indexTarget - indexLevel + 1}, (v, k) => k+indexLevel); 
    var query = {level: { $in: inQueryLevel}};
    lessonRepo.getAll(query, 30, 0).then(lessons => {
        lessons.sort(sortLessonByLevelAndUnit);

        var timeToStudyAllLesson = 0;
        lessons.forEach(lesson => {
            timeToStudyAllLesson += lesson.estTime;
        });
        var rs = dayNeedToStudy(lessons, timeToStudyAllLesson, hoursPerDay, dateStart, dateEnd);
        // var day = Math.round((new Date(dateEnd)-new Date(dateStart))/(1000*60*60*24));
        // var timeNeedByDay = timeToStudyAllLesson / day;
        // console.log(day, timeToStudy, timeNeedByDay);
        res.status(200);
        res.json({success: true, value: {result: rs}});
    });
}

function sortLessonByLevelAndUnit(lesson1, lesson2) {
    if(lesson1.level == lesson2.level) {
        return lesson1.unit - lesson2.unit;
    }
    return lesson1.level - lesson2.level;
}

function dayNeedToStudy(lessons, timeToStudyAllLesson, hoursPerDay, dateStart, dateEnd) {
    var day = Math.round((new Date(dateEnd)-new Date(dateStart))/(1000*60*60*24));
    var timeNeedLearnByDay = timeToStudyAllLesson / day;
    var minutesByDay = hoursPerDay*60;
    //thời gian học thực tế lớn hơn lý thuyết => cho học theo thực tế => chia lại lộ trình theo thực tế
    // if(timeNeedLearnByDay < minutesByDay) {
    //     createRoute(lessons, minutesByDay, dateStart)
    // } else {
    //     createRoute(lessons, minutesByDay, dateStart)
    // }
    console.log(minutesByDay, timeNeedLearnByDay);
    var x1 = createRoute(lessons, minutesByDay, dateStart);
    var x2 = createRoute(lessons, timeNeedLearnByDay, dateStart);
    return [x1, x2];
}

function createRoute(lessons, time, start) {
    var dateStart = new Date(start);
    var route = [];
    var lessonToLearn = [];
    var timeTemp = 0;
    for (let i = 0; i < lessons.length; i++) {
        const element = lessons[i];
        timeTemp += element.estTime;

        lessonToLearn.push(element);
        var indexOfRoute= route.findIndex(i => {console.log(i.day, dateStart); return i.day.getTime() === dateStart.getTime()});
        // var indexOfRoute = -1;
        // for (let j = 0; j < route.length; j++) {
        //     if(route[j].day === dateStart) {
        //         indexOfRoute = j;
        //         break;
        //     }            
        // }
        console.log(indexOfRoute, dateStart);
        if(indexOfRoute < 0) {
            route.push({day: new Date(dateStart.getTime()), lessons: lessonToLearn});
            // console.log(route);
        }
        else {
            lessonToLearn = lessonToLearn.concat(route[indexOfRoute].lessons);
            route[indexOfRoute].lessons = lessonToLearn;
        }

        if(timeTemp > time) {
            // console.log(timeTemp, time);
            timeTemp = 0;
            dateStart.setDate(dateStart.getDate() + 1);

        }
        lessonToLearn = [];

    }
    return route;
}