'use strict';

var util = require('util');
const config = require('./config')
const vocabularyRepo = require('../../repository/vocabularyRepo')


var ObjectId = require('mongodb').ObjectID;
const limit = 5;

module.exports = {
    getVocabularyByDay,
    addVocabulary: add,
    getVocabularyByType: getVocabularyByType,
    getAllVocabulary,
    deleteVocabulary: deleteVoc,
    getVocabularyById: getVocById,
};

function getVocabularyByDay(req, res) {
    vocabularyRepo.getType(1).then(value => {
        var type = value[0];
        vocabularyRepo.getRandomByType(type._id, limit).then(result => {
            res.status(200);
            res.json({
                success: true,
                value: {
                    vocabulary: result
                }
            });
        }).catch(err => {
            res.status(400);
            res.json({
                success: false,
                message: err.err
            });
        })
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    })
}

function add(req, res) {

    var body = req.swagger.params.body.value;
    var vocabulary = body.vocabulary.trim();
    var mean = body.mean.trim();
    var type = body.type.trim().toUpperCase();
    vocabularyRepo.findVocType({
        type: type
    }).then(result => {
        if (!result || result.length == 0) {
            vocabularyRepo.addVocType({
                type: type
            }).then(resultAddVoc => {
                vocabularyRepo.insert({
                    type: resultAddVoc.ops[0]._id,
                    vocabulary: vocabulary,
                    mean: mean
                }).then(value => {
                    res.status(200);
                    res.json({
                        success: true,
                        value: value
                    });
                }).catch(err => {
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
        } else {
            vocabularyRepo.insert({
                type: result._id,
                vocabulary: vocabulary,
                mean: mean
            }).then(value => {
                res.status(200);
                res.json({
                    success: true,
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
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    });
}

function getVocabularyByType(req, res) {
    var type = req.swagger.params.vocabularyType.value.trim();
    vocabularyRepo.findVocType({
        type: type.toUpperCase()
    }).then(value => {
        var type = value;
        vocabularyRepo.getRandomByType(type._id, limit).then(result => {
            res.status(200);
            res.json({
                success: true,
                value: {
                    vocabulary: result
                }
            });
        }).catch(err => {
            res.status(400);
            res.json({
                success: false,
                message: err.err
            });
        })
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    })
}

function getAllVocabulary(req, res) {
    var limit = 10;
    var page = 0;
    var params = req.swagger.params;

    if (params.page) {
        page = params.page.value;
    }
    if (params.limit) {
        limit = params.limit.value;
    }
    vocabularyRepo.getAll(limit, page).then(result => {
        res.status(200);
        res.json({
            success: true,
            value: {
                vocabulary: result
            }
        });
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    })
}
// function update(req, res) {

//     var lessonId = req.swagger.params.lessonId.value;
//     var body = req.swagger.params.body.value;
//     var content = body.content;
//     var categoryIdNew = body.categoryId;
//     var topicIdNew = body.topicId;
//     var titleNew = body.title;
//     var levelNew = body.level;
//     var data = {
//         content: content,
//         categoryId: categoryIdNew,
//         topicId: topicIdNew,
//         title: titleNew,
//         level: levelNew
//     }
//     //console.log(util.inspect(data, {showHidden: false, depth: null}))
//     var query = {
//         "_id": new ObjectId(lessonId)
//     };
//     var queryTopicNew = {
//         "_id": new ObjectId(topicIdNew)
//     };
//     var queryCategoryNew = {
//         "_id": new ObjectId(categoryIdNew)
//     };

//     const lessonFound = lessonRepo.findOne(query);
//     const topicFound = topicRepo.findOne(queryTopicNew);
//     const categoryFound = categoryRepo.findOne(queryCategoryNew);

//     Promise.all([lessonFound, topicFound, categoryFound]).then(([lesson, topic, category]) => {

//         if (!lesson) {
//             res.status(400);
//             res.json({
//                 success: false,
//                 message: "lesson not found"
//             });
//             return;
//         }
//         if (!topic) {
//             res.status(400);
//             res.json({
//                 success: false,
//                 message: "topic not found"
//             });
//             return;
//         }
//         if (!category) {
//             res.status(400);
//             res.json({
//                 success: false,
//                 message: "category not found"
//             });
//             return;
//         }
//         if (!category._id.equals(topic.categoryId)) {
//             res.status(400);
//             res.json({
//                 success: false,
//                 message: "topic not found in category"
//             });
//             return;
//         }

//         lessonRepo.update(query, data).then(value => {
//             if (lesson.topicId !== topicIdNew) {
//                 var queryTopicOld = {
//                     "_id": new ObjectId(lesson.topicId)
//                 };
//                 var queryCategoryOld = {
//                     "_id": new ObjectId(lesson.categoryId)
//                 };

//                 topicRepo.update(queryTopicOld, {
//                     $pull: {
//                         lessons: {
//                             _id: lesson._id,
//                             title: lesson.title,
//                             level: lesson.level
//                         }
//                     }
//                 });
//                 topicRepo.update(queryTopicNew, {
//                     $push: {
//                         lessons: {
//                             _id: lesson._id,
//                             title: titleNew,
//                             level: levelNew
//                         }
//                     }
//                 });
//                 categoryRepo.update({
//                     "_id": new ObjectId(lesson.categoryId),
//                     "topics._id": new ObjectId(lesson.topicId)
//                 }, {
//                     $pull: {
//                         'topics.$.lessons': {
//                             _id: lesson._id
//                         }
//                     }
//                 });
//                 categoryRepo.update({
//                     "_id": new ObjectId(categoryIdNew),
//                     "topics._id": new ObjectId(topicIdNew)
//                 }, {
//                     $push: {
//                         'topics.$.lessons': {
//                             _id: lesson._id,
//                             title: data.title,
//                             level: data.level
//                         }
//                     }
//                 });
//             } else {
//                 var queryTopicUpdate = {
//                     "lessons._id": lesson._id
//                 };
//                 topicRepo.update(queryTopicUpdate, {
//                     $set: {
//                         "lessons.$.title": titleNew,
//                         "lessons.$.level": levelNew
//                     }
//                 });

//                 categoryRepo.update({
//                     "_id": new ObjectId(lesson.categoryId),
//                     "topics._id": new ObjectId(lesson.topicId)
//                 }, {
//                     $pull: {
//                         'topics.$.lessons': {
//                             _id: lesson._id
//                         }
//                     }
//                 });
//                 categoryRepo.update({
//                     "_id": new ObjectId(categoryIdNew),
//                     "topics._id": new ObjectId(topicIdNew)
//                 }, {
//                     $push: {
//                         'topics.$.lessons': {
//                             _id: lesson._id,
//                             title: data.title,
//                             level: data.level
//                         }
//                     }
//                 });
//             }
//             res.status(200);
//             res.json({
//                 success: true,
//                 value: data
//             });
//             return;
//         }).catch(err => {
//             res.status(400);
//             res.json({
//                 success: false,
//                 message: err.err
//             });
//         });
//     }).catch(err => {
//         res.status(400);
//         res.json({
//             success: false,
//             message: err.err
//         });
//     });
// }

function deleteVoc(req, res) {
    var vocabularyId = req.swagger.params.vocabularyId.value.trim();

    vocabularyRepo.delete({_id: new ObjectId(vocabularyId)}).then(result => {
        res.status(200);
        res.json({
            success: true,
            message: 'Deleted successfully'
        });
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    })
}

function getVocById(req, res) {
    var vocabularyId = req.swagger.params.vocabularyId.value.trim();

    vocabularyRepo.findOne({_id: new ObjectId(vocabularyId)}).then(result => {
        res.status(200);
        res.json({
            success: true,
            value: {
                vocabulary: result
            }        
        });
    }).catch(err => {
        res.status(400);
        res.json({
            success: false,
            message: err.err
        });
    })
}