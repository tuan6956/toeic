'use strict';

var util = require('util');
const config = require('./config')
var moment = require('moment');

const minitestRepo = require('../../repository/miniTestRepo')
const historyRepo = require('../../repository/historyRepo')
const lessonRepo = require('../../repository/lessonRepo')
const userRepo = require('../../repository/userRepo')


var ObjectId = require('mongodb').ObjectID;
const arrayMilestons = [0, 100, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 990];
module.exports = {
    getRoute: getRouteToday,
    getAdvise: getAdvise,
};

const categoryGrammar = "5cd2f5b8396de30e8833ab4b";
const categoryVocabulary = "5cffdf91d7af6c0f8c107cb5";


function getRouteToday(req, res) {
    // var indexLevel = Math.round(level/50);
    // var indexTarget = Math.round(target/50);
    var userFind = userRepo.findOne({
        email: req.email
    });
    var historyFind = historyRepo.findOne({
        email: req.email
    });
    var now = moment().format('YYYY-MM-DD');
    var minitestFind =  minitestRepo.random(1);
    
    //     lessonToLearn.push({_id: new ObjectId(minitest._id),passed: false, type: "minitest"});
        
    // });
    Promise.all([userFind, historyFind, minitestFind]).then(([user, history, minitest]) => {
        // console.log(minitest._id)
        if (!user) {
            res.status(400);
            res.json({
                success: false,
                message: ''
            });
            return;
        }
        // if (typeof user.isPayment === "undefined" || user.isPayment == false) {
        //     res.status(200);
        //     res.json({
        //         success: false,
        //         message: 'Bạn cần nâng cấp tài khoản để tiếp tục sử dụng ứng dụng này'
        //     });
        //     return;
        // }
        var indexLevel = -1;
        var indexTarget = arrayMilestons.length - 1;
        for (let i = 0; i < arrayMilestons.length; i++) {
            if(user.level <= arrayMilestons[i] && indexLevel !== -1) 
                indexLevel = i;
            if(user.target.targetPoint  <= arrayMilestons[i] && indexTarget !== -1) 
                indexTarget = i;
        }
        var indexLevel = Math.round(user.level.original / 50);
        var indexTarget = Math.round(user.target.targetPoint / 50);
        var hoursPerDay = user.target.hoursPerDay;
        var dateStart = user.target.startDate;
        var dateEnd = user.target.endDate;
        var inQueryLevel = Array.from({
            length: indexTarget - indexLevel + 1
        }, (v, k) => k + indexLevel);

        var indexTimeStudy  = -1;
        if (typeof user.timeStudy !== "undefined") {
            indexTimeStudy = user.timeStudy.findIndex(date => {
                return date === now;
            })
        }
        var timeStudy = 0;
        if (indexTimeStudy != -1)
            timeStudy = user.timeStudy[indexTimeStudy].time;

        if (history) {
            var indexHistoryByDay = -1;
            var listLessonStudied = [];
            for (let i = 0; i < history.history.length; i++) {
                const his = history.history[i];
                if (his.date === now) {
                    indexHistoryByDay = i;
                }

                his.lessons.forEach(lesson => {
                    if(lesson.type === "lesson")
                        if (lesson.lessonPassed && lesson.exercisePassed ) {
                            listLessonStudied.push(new ObjectId(lesson._id));
                        }
                    else
                        if (!lesson.passed) {
                            listLessonStudied.push(new ObjectId(lesson._id));
                        }
                });
            }
            //đã có rồi thì lấy ra
            if (indexHistoryByDay != -1) {
                var flagStudiedAll = true;
                history.history[indexHistoryByDay].lessons.forEach(lesson => {
                    if(lesson.type === "lesson")
                        if (!lesson.lessonPassed || !lesson.exercisePassed ) {
                            flagStudiedAll = false;
                        }
                    else
                        if (!lesson.passed) {
                            flagStudiedAll = false;
                        }
                });
                if (!flagStudiedAll) { // chưa học hết
                    res.status(200);
                    res.json({
                        success: true,
                        value: history.history[indexHistoryByDay]
                    });
                } else { // đã học hết và muốn học ngày tiếp theo
                    var query = {
                        level: {
                            $in: inQueryLevel
                        },
                        _id: {
                            $nin: listLessonStudied
                        }
                    };
                    lessonRepo.getAll(query, 0, 0).then(lessons => {
                        lessons.sort(sortLessonByLevelAndUnit);
                        

                        var rs = routeToday(lessons, hoursPerDay, now, dateEnd);
                        rs.lessons.push({_id: new ObjectId(minitest[0]._id),passed: false, type: "minitest", title: 'Mini Test'});

                        //cần update history

                        historyRepo.update({
                            email: req.email,
                            'history.date': now
                        }, {
                            $push: {
                                'history.$.lessons': {
                                    $each: rs.lessons
                                }
                            }
                        })
                        // var day = Math.round((new Date(dateEnd)-new Date(dateStart))/(1000*60*60*24));
                        // var timeNeedByDay = timeToStudyAllLesson / day;
                        // console.log(day, timeToStudy, timeNeedByDay);
                        res.status(200);
                        res.json({
                            success: true,
                            value: rs
                        });
                    });
                }

            } else { //chua có thì insert vo history
                var query = {
                    level: {
                        $in: inQueryLevel
                    },
                    _id: {
                        $nin: listLessonStudied
                    }
                };
                // lessonGrammarQuery = lessonRepo.getAll(query, 0, 0);
                // lessonGrammarQuery = lessonRepo.getAll(query, 0, 0);

                lessonRepo.getAll(query, 0, 0).then(lessons => {
                    var lessonGrammar = lessons.filter(lesson => {return lesson.categoryId === categoryGrammar});
                    var lessonVocabulary = lessons.filter(lesson => {return lesson.categoryId === categoryVocabulary});

                    lessonGrammar.sort(sortLessonByLevelAndUnit);
                    var rs = routeToday(lessonGrammar, hoursPerDay, now, dateEnd);
                    rs.lessons.push({_id: new ObjectId(minitest[0]._id),passed: false, type: "minitest", title: 'Mini Test'});

                    var itemLessonVocabularRandom = lessonVocabulary[Math.floor(Math.random()*lessonVocabulary.length)];
                    if(itemLessonVocabularRandom) {
                        itemLessonVocabularRandom.passed = false;
                        itemLessonVocabularRandom.type = 'vocabulary';
                        rs.lessons.push(itemLessonVocabularRandom);
                    }
        
                    //cần update history
            
                    historyRepo.update({
                        email: req.email
                    }, {
                        $push: {
                            history: {
                                date: now,
                                lessons: rs.lessons,
                                dateEnd: rs.dateEnd,
                                timeNeedLearnByDay: rs.timeNeed,
                                progress: 0,
                                timeStudy: timeStudy
                            }
                        }
                    })
                    // var day = Math.round((new Date(dateEnd)-new Date(dateStart))/(1000*60*60*24));
                    // var timeNeedByDay = timeToStudyAllLesson / day;
                    // console.log(day, timeToStudy, timeNeedByDay);
                    res.status(200);
                    res.json({
                        success: true,
                        value: rs
                    });
                });
            }
        } else {
            var query = {
                level: {
                    $in: inQueryLevel
                }
            };
            lessonRepo.getAll(query, 0, 0).then(lessons => {

                var lessonGrammar = lessons.filter(lesson => {return lesson.categoryId === categoryGrammar});
                var lessonVocabulary = lessons.filter(lesson => {return lesson.categoryId === categoryVocabulary});

                lessonGrammar.sort(sortLessonByLevelAndUnit);
                var rs = routeToday(lessonGrammar, hoursPerDay, now, dateEnd);
                rs.lessons.push({_id: new ObjectId(minitest[0]._id),passed: false, type: "minitest", title: 'Mini Test'});

                var itemLessonVocabularRandom = lessonVocabulary[Math.floor(Math.random()*lessonVocabulary.length)];
                if(itemLessonVocabularRandom) {
                    itemLessonVocabularRandom.passed = false;
                    itemLessonVocabularRandom.type = 'vocabulary';
                    rs.lessons.push(itemLessonVocabularRandom);
                }

                historyRepo.insert({
                    email: req.email,
                    history: [{
                        date: now,
                        lessons: rs.lessons,
                        dateEnd: rs.dateEnd,
                        timeNeedLearnByDay: rs.timeNeed,
                        progress: 0,
                        timeStudy: timeStudy
                    }]
                })
                // var day = Math.round((new Date(dateEnd)-new Date(dateStart))/(1000*60*60*24));
                // var timeNeedByDay = timeToStudyAllLesson / day;
                // console.log(day, timeToStudy, timeNeedByDay);
                res.status(200);
                res.json({
                    success: true,
                    value: rs
                });
            });
        }
    });


}

function getAdvise(req, res) {
    var body = req.swagger.params.body.value;
    var hoursPerDay = body.hoursPerDay;
    var target = body.target;
    var level = body.level;
    var dateStart = body.dateStart;
    var dateEnd = body.dateEnd;
    if(target < level) {
        res.status(200);
        res.json({
            success: false,
            message: "Target is less level",
            value: null
        });
        return;
    }

    suggestTimeStudy(hoursPerDay, dateStart, dateEnd, target, level).then(rs => {
        res.status(200);
        res.json({
            success: true,
            value: rs
        });
    });
    
}


function sortLessonByLevelAndUnit(lesson1, lesson2) {
    if (lesson1.level == lesson2.level) {
        return lesson1.unit - lesson2.unit;
    }
    return lesson1.level - lesson2.level;
}

function routeToday(lessons, hoursPerDay, dateStart, dateEnd) {
    var timeToStudyAllLesson = 0;
    lessons.forEach(lesson => { 
        timeToStudyAllLesson += lesson.estTime;
    });
    var day = Math.round((new Date(dateEnd) - new Date(dateStart)) / (1000 * 60 * 60 * 24));
    var timeNeedLearnByDay = timeToStudyAllLesson / day;
    var minutesByDay = hoursPerDay * 60;
    //thời gian học thực tế lớn hơn lý thuyết => cho học theo thực tế => chia lại lộ trình theo thực tế
    var rs = null;

    if (timeNeedLearnByDay < minutesByDay) {
        rs = createRoute(lessons, minutesByDay, dateStart)
    } else {
        rs = createRoute(lessons, timeNeedLearnByDay, dateStart)
    }
    // var lessonToLearn = createRoute(lessons, minutesByDay, dateStart);
    // var x2 = createRoute(lessons, timeNeedLearnByDay, dateStart);
    // return [x1, x2];
    return rs;
}

function createRoute(lessons, time, start) {
    var datetEnd = new Date(start);
    var route = [];
    var lessonToLearn = [];
    var timeTemp = 0;
    var flagLessonsToday = false;
    for (let i = 0; i < lessons.length; i++) {
        const element = lessons[i];
        timeTemp += element.estTime;
        element.lessonPassed = false;
        element.exercisePassed = false;
        if (!flagLessonsToday) {
            element.type = "lesson";
            lessonToLearn.push(element);
        }
        // var indexOfRoute= route.findIndex(i => {console.log(i.day, dateStart); return i.day.getTime() === dateStart.getTime()});
        // var indexOfRoute = -1;
        // for (let j = 0; j < route.length; j++) {
        //     if(route[j].day === dateStart) {
        //         indexOfRoute = j;
        //         break;
        //     }            
        // }
        // console.log(indexOfRoute, dateStart);
        // if(indexOfRoute < 0) {
        //     route.push({day: new Date(dateStart.getTime()), lessons: lessonToLearn});
        //     // console.log(route);
        // }
        // else {
        //     lessonToLearn = lessonToLearn.concat(route[indexOfRoute].lessons);
        //     route[indexOfRoute].lessons = lessonToLearn;
        // }

        if (timeTemp > time) {
            flagLessonsToday = true;
            // console.log(timeTemp, time);
            timeTemp = 0;
            datetEnd.setDate(datetEnd.getDate() + 1);

        }
        // lessonToLearn = [];

    }
    // minitestRepo.random(1).then(minitest => {
    //     lessonToLearn.push({_id: new ObjectId(minitest._id),passed: false, type: "minitest"});
        
    // });
    
    return {
        lessons: lessonToLearn,
        dateEnd: moment(datetEnd).format('YYYY-MM-DD'),
        timeNeed: time
    };
}

async function suggestTimeStudy(hoursPerDay, dateStart, dateEnd, target, level) {
    var indexLevel = -1;
    var indexTarget = arrayMilestons.length - 1;
    for (let i = 0; i < arrayMilestons.length; i++) {
        if(level <= arrayMilestons[i] && indexLevel !== -1) 
            indexLevel = i;
        if(target <= arrayMilestons[i] && indexTarget !== -1) 
            indexTarget = i;
    }
    var inQueryLevel = Array.from({
        length: indexTarget - indexLevel + 1
    }, (v, k) => k + indexLevel);

    var query = {
        level: {
            $in: inQueryLevel
        }
    };
    var lessons = null;
    await lessonRepo.getAll(query, 0, 0).then(value => {
         lessons = value;
    })

    var timeToStudyAllLesson = 0;
    lessons.forEach(lesson => {
        timeToStudyAllLesson += lesson.estTime;
    });
    var day = Math.round((new Date(dateEnd) - new Date(dateStart)) / (1000 * 60 * 60 * 24));
    var timeNeedLearnByDay = timeToStudyAllLesson / day;
    var minutesByDay = hoursPerDay * 60;
    var rs1 = createRoute(lessons, minutesByDay, dateStart);
    var rs2 =  createRoute(lessons, timeNeedLearnByDay, dateStart);
    delete rs1.lessons;
    delete rs2.lessons;
    return {
        timeNeedReality: rs1.timeNeed, 
        dateEndReality: rs1.dateEnd,
        timeNeedTheory: rs2.timeNeed, 
        dateEndTheory: rs2.dateEnd,
    };
}