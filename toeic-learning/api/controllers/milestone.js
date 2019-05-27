'use strict';

var util = require('util');
const config = require('./config')
const milestoneRepo = require('../../repository/milestoneRepo')
const categoryRepo = require('../../repository/categoryRepo')
const lessonRepo = require('../../repository/lessonRepo')


var ObjectId = require('mongodb').ObjectID;

module.exports = {
    getAllMilestone: getAll,
    getOneMiletone: getOne,
    addMilestone: addMilestone,
    updateMilestone: updateMilestone
};

function getAll(req, res) {
    var limit = 10;
    var page = 0;
    var params = req.swagger.params;
    if (params.page) {
        page = params.page.value;
    }
    if (params.limit) {
        limit = params.limit.value;
    }
    milestoneRepo.getAll(limit, page).then(value => {
        if (!value)
            value = [];
        res.status(200);
        res.json({
            success: true,
            value: {
                milestones: value
            }
        });
    }).catch(error => {
        res.status(200);
        res.json({
            success: false,
            message: err.err
        });
    });

}

function getOne(req, res) {
    var milestoneId = req.swagger.params.milestoneId.value.trim();
    milestoneRepo.findOne({
        "_id": new ObjectId(milestoneId)
    }).then(value => {
        var success = true;
        var mess = "";
        var statusCode = 200;
        if (!value) {
            success = false;
            value = {};
            mess = "Milestone not found";
            statusCode = 400;

        }
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

function addMilestone(req, res) {

    var body = req.swagger.params.body.value;
    var name = body.name.trim();

    var queryMilestone = {
        "name": name
    };
    var data = {
        name: name,
    }
    milestoneRepo.findOne(queryMilestone).then(value => {
        if (value) {
            res.status(400);
            res.json({
                success: false,
                message: "Milestone  already existed"
            });
            return;
        } else {
            milestoneRepo.insert(data).then(result => {
                console.log(result);
                res.status(200);
                res.json({
                    success: true,
                    value: data
                });
            }).catch(err => {
                res.status(400);
                res.json({
                    success: false,
                    message: err.err
                });
            })
        }
    })
}

function updateMilestone(req, res) {

    var body = req.swagger.params.body.value;
    var milestoneId = req.swagger.params.milestoneId.value.trim();
    var milestoneName = '',
        categoryId = '',
        lessonId = '',
        testId = '';
    var queryMilestone = null, queryCategory = null, queryLesson = null;
    var milestoneFound = null, categoryFound = null, lessonFound = null;

    if (body.name) {
        milestoneName = body.name.trim();
        queryMilestone = {
            "_id": new ObjectId(milestoneId)
        };
    }
    if (body.categoryId) {
        categoryId = body.categoryId.trim();
        queryCategory = {
            "_id": new ObjectId(categoryId)
        };
        categoryFound = categoryRepo.findOne(queryCategory);

    }
    if (body.lessonId) {
        lessonId = body.lessonId.trim();
        queryLesson = {
            "_id": new ObjectId(lessonId)
        };
        lessonFound = lessonRepo.findOne(queryLesson);
    }
    if (body.testId)
        testId = body.testId.trim();
    var milestoneFound = milestoneRepo.findOne(queryMilestone);

    Promise.all([milestoneFound, categoryFound, lessonFound]).then(([milestone_rs, category, lesson]) => {
        // var milestone = [...milestone];
        var milestone = Object.assign(milestone_rs);
        delete milestone._id;
        if (!milestone) {
            res.status(400);
            res.json({
                success: false,
                message: "Milestone not found"
            });
            return;
        }

        var lesson_get = null;
        if (!lesson && lessonId !== '') {
            res.status(400);
            res.json({
                success: false,
                message: "Lesson not found"
            });
            return;
        } else if(lesson && lessonId !== '') {
            lesson_get = lesson;
        }

        if (!category && categoryId !== '') {
            res.status(400);
            res.json({
                success: false,
                message: "Category not found"
            });
            return;
        } else if (milestone.category  && categoryId !== category._id) {
        } else if(category && categoryId !== '') {
            milestone.category = {
                _id: new ObjectId(category._id),
                name: category.name,
            }
            

        }
        
        
        

        var lessons = [];
        if (milestone.category && milestone.category.lessons && lessonId !== '') {
            lessons.concat(milestone.category.lessons);
            milestone.category.lessons = lessons;
        } else if(lessonId !== '') {
            delete lesson.content;
            lessons.push(lesson);
            milestone.category.lessons = lessons;

        }

        if(testId !== '') {
            milestone.test = testId;
        }
        if (milestoneName) {
            milestone.name = milestoneName;
        }
        // milestone.category = {
        //     _id: category._id,
        //     title: category.title,
        //     lessons: lessons
        // }
        console.log('4',milestone);
        milestoneRepo.update({"_id": new ObjectId(milestoneId)}, milestone).then(result => {
            res.status(200);
            res.json({
                success: true,
                value: milestone
            });
        }).catch(err => {
            console.log(err);
            res.status(400);
            res.json({
                success: false,
                message: err.err
            });
        });

    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    });
}