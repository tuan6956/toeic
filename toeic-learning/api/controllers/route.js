'use strict';

var util = require('util');
const config = require('./config')
var moment = require('moment');

const milestoneRepo = require('../../repository/milestoneRepo')
const historyRepo = require('../../repository/historyRepo')
const lessonRepo = require('../../repository/lessonRepo')
const userRepo = require('../../repository/userRepo')


var ObjectId = require('mongodb').ObjectID;
const arrayMilestons = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950];
module.exports = {
    getRoute: getRouteToday,
    abcua: sortLessonByLevelAndUnit
};



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
    Promise.all([userFind, historyFind]).then(([user, history]) => {
        if (!user) {
            res.status(400);
            res.json({
                success: false,
                message: ''
            });
            return;
        }
        var indexLevel = Math.round(user.level / 50);
        var indexTarget = Math.round(user.target.targetPoint / 50);
        var hoursPerDay = user.target.hoursPerDay;
        var dateStart = user.target.startDate;
        var dateEnd = user.target.endDate;
        var inQueryLevel = Array.from({
            length: indexTarget - indexLevel + 1
        }, (v, k) => k + indexLevel);
        
        var indexTimeStudy = user.timeStudy.findIndex(date => {
            return date === now;
        })
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
                    if (lesson.theory) // đã học lý thuyết
                        listLessonStudied.push(new ObjectId(lesson._id));
                });
            }

            //đã có rồi thì lấy ra
            if (indexHistoryByDay != -1) {
                var flagStudiedAll = true;
                history.history[indexHistoryByDay].lessons.forEach(lesson => {
                    if (!lesson.lessonPassed || !lesson.exercisePassed) {
                        flagStudiedAll = false;
                    }
                });
                if (!flagStudiedAll) { // chưa học hết
                    console.log('123123123');
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
                    lessonRepo.getAll(query, 30, 0).then(lessons => {
                        lessons.sort(sortLessonByLevelAndUnit);
                        var timeToStudyAllLesson = 0;
                        lessons.forEach(lesson => {
                            timeToStudyAllLesson += lesson.estTime;
                        });

                        var rs = routeToday(lessons, timeToStudyAllLesson, hoursPerDay, now, dateEnd);

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
                lessonRepo.getAll(query, 30, 0).then(lessons => {
                    lessons.sort(sortLessonByLevelAndUnit);
                    var timeToStudyAllLesson = 0;
                    lessons.forEach(lesson => {
                        timeToStudyAllLesson += lesson.estTime;
                    });

                    var rs = routeToday(lessons, timeToStudyAllLesson, hoursPerDay, now, dateEnd);
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
            lessonRepo.getAll(query, 30, 0).then(lessons => {
                lessons.sort(sortLessonByLevelAndUnit);

                var timeToStudyAllLesson = 0;
                lessons.forEach(lesson => {
                    timeToStudyAllLesson += lesson.estTime;
                });
                var rs = routeToday(lessons, timeToStudyAllLesson, hoursPerDay, now, dateEnd);
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

}


function sortLessonByLevelAndUnit(lesson1, lesson2) {
    if (lesson1.level == lesson2.level) {
        return lesson1.unit - lesson2.unit;
    }
    return lesson1.level - lesson2.level;
}

function routeToday(lessons, timeToStudyAllLesson, hoursPerDay, dateStart, dateEnd) {
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
            break;
            // console.log(timeTemp, time);
            timeTemp = 0;
            datetEnd.setDate(datetEnd.getDate() + 1);

        }
        // lessonToLearn = [];

    }
    return {
        lessons: lessonToLearn,
        dateEnd: moment(datetEnd).format('YYYY-MM-DD'),
        timeNeed: time
    };
}

function suggestTimeStudy(hoursPerDay, dateStart, target, level) {
    var indexLevel = Math.round(user.level / 50);
    var indexTarget = Math.round(user.target.targetPoint / 50);
    var inQueryLevel = Array.from({
        length: indexTarget - indexLevel + 1
    }, (v, k) => k + indexLevel);

    var query = {
        level: {
            $in: inQueryLevel
        }
    };
    Promise.all([historyFind]).then(([history]) => {
        if (!user) {
            res.status(400);
            res.json({
                success: false,
                message: ''
            });
            return;
        }

        var dateEnd = user.target.endDate;
        var inQueryLevel = Array.from({
            length: indexTarget - indexLevel + 1
        }, (v, k) => k + indexLevel);

        if (history) {
            var indexHistoryByDay = -1;
            var listLessonStudied = [];
            for (let i = 0; i < history.history.length; i++) {
                const his = history.history[i];
                if (his.date === now) {
                    indexHistoryByDay = i;
                }

                his.lessons.forEach(lesson => {
                    if (lesson.theory) // đã học lý thuyết
                        listLessonStudied.push(new ObjectId(lesson._id));
                });
            }

            //đã có rồi thì lấy ra
            if (indexHistoryByDay != -1) {
                var flagStudiedAll = true;
                history.history[indexHistoryByDay].lessons.forEach(lesson => {
                    if (!lesson.lessonPassed || !lesson.exercisePassed) {
                        flagStudiedAll = false;
                    }
                });
                if (!flagStudiedAll) { // chưa học hết
                    res.status(200);
                    ``
                    res.json({
                        success: true,
                        value: history.history[indexHistoryByDay].lessons
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
                    lessonRepo.getAll(query, 30, 0).then(lessons => {
                        lessons.sort(sortLessonByLevelAndUnit);
                        var timeToStudyAllLesson = 0;
                        lessons.forEach(lesson => {
                            timeToStudyAllLesson += lesson.estTime;
                        });

                        var rs = routeToday(lessons, timeToStudyAllLesson, hoursPerDay, now, dateEnd);

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
                            value: {
                                result: rs
                            }
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
                lessonRepo.getAll(query, 30, 0).then(lessons => {
                    lessons.sort(sortLessonByLevelAndUnit);
                    var timeToStudyAllLesson = 0;
                    lessons.forEach(lesson => {
                        timeToStudyAllLesson += lesson.estTime;
                    });

                    var rs = routeToday(lessons, timeToStudyAllLesson, hoursPerDay, now, dateEnd);
                    //cần update history

                    historyRepo.update({
                        email: req.email
                    }, {
                        $push: {
                            history: {
                                day: now,
                                lessons: rs.lessons,
                            }
                        }
                    })
                    // var day = Math.round((new Date(dateEnd)-new Date(dateStart))/(1000*60*60*24));
                    // var timeNeedByDay = timeToStudyAllLesson / day;
                    // console.log(day, timeToStudy, timeNeedByDay);
                    res.status(200);
                    res.json({
                        success: true,
                        value: {
                            result: rs
                        }
                    });
                });
            }
        } else {
            var query = {
                level: {
                    $in: inQueryLevel
                }
            };
            lessonRepo.getAll(query, 30, 0).then(lessons => {
                lessons.sort(sortLessonByLevelAndUnit);

                var timeToStudyAllLesson = 0;
                lessons.forEach(lesson => {
                    timeToStudyAllLesson += lesson.estTime;
                });
                var rs = routeToday(lessons, timeToStudyAllLesson, hoursPerDay, now, dateEnd);
                historyRepo.insert({
                    email: req.email,
                    history: [{
                        date: now,
                        lessons: rs.lessons
                    }]

                })
                // var day = Math.round((new Date(dateEnd)-new Date(dateStart))/(1000*60*60*24));
                // var timeNeedByDay = timeToStudyAllLesson / day;
                // console.log(day, timeToStudy, timeNeedByDay);
                res.status(200);
                res.json({
                    success: true,
                    value: {
                        result: rs
                    }
                });
            });
        }
    });
}