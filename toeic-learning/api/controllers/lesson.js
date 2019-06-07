'use strict';

var util = require('util');
const config = require('./config')
const lessonRepo = require('../../repository/lessonRepo')
const topicRepo = require('../../repository/topicRepo')
const categoryRepo = require('../../repository/categoryRepo')


var ObjectId = require('mongodb').ObjectID;

module.exports = {
  getLessons: get,
  addLesson: add,
  updateLesson: update,
  findOneLesson: getOne,
  deleteLesson: deleteLesson
};

function get(req, res) {
  var limit = 10;
  var page = 0;
  var params = req.swagger.params;

  if (params.page) {
    page = params.page.value;
  }
  if (params.limit) {
    limit = params.limit.value;
  }

  lessonRepo.getAll({}, limit, page).then(value => {
    //console.log(util.inspect(value, {showHidden: false, depth: null}))
    if (!value)
      value = [];
    res.status(200);
    res.json({
      success: true,
      value: {
        lessons: value
      }
    });
  }).catch(error => {
    res.status(400);
    res.json({
      success: false,
      message: err.err
    });
  });
}

function getOne(req, res) {

  var lessonId = req.swagger.params.lessonId.value.trim();
  //middleware
  // if(lessonId.length !== 24) {
  //   res.status(200);
  //   res.json({success: false, message: "lessonId not found"});
  // }
  lessonRepo.findOne({
    "_id": new ObjectId(lessonId)
  }).then(value => {
    var success = true;
    var mess = "";
    var statusCode = 200;
    if (!value) {
      success = false;
      value = {};
      mess = "lessonId not found";
      statusCode = 400;
    }
    //console.log(util.inspect(value, {showHidden: false, depth: null}))

    res.status(statusCode);
    res.json({
      success: success,
      message: mess,
      value: value
    });
  }).catch(err => {
    //console.log(util.inspect(err, {showHidden: false, depth: null}))
    res.status(400);
    res.json({
      success: false,
      message: err.err
    });
  });
}

function add(req, res) {

  var body = req.swagger.params.body.value;
  var content = body.content;
  var categoryId = body.categoryId;
  var topicId = body.topicId;
  var title = body.title;
  var milestone = body.milestone;
  var estTime = body.estTime;
  var unit = body.unit;


  var data = {
    content: content,
    categoryId: categoryId,
    topicId: topicId,
    title: title,
    milestone: milestone,
    estTime: estTime,
    unit: unit
  };

  var queryTopic = {
    "_id": new ObjectId(topicId)
  };
  var queryCategory = {
    "_id": new ObjectId(categoryId)
  };

  const topicFound = topicRepo.findOne(queryTopic);
  const categoryFound = categoryRepo.findOne(queryCategory);
  const lessonUnit = lessonRepo.getAll({level: 5},0,0);
  Promise.all([topicFound, categoryFound, lessonUnit]).then(([topic, category, lesson]) => {  

    if (!category) {
      res.status(400);
      res.json({
        success: false,
        message: "category not found"
      });
      return;
    }
    if (!topic) {
      res.status(400);
      res.json({
        success: false,
        message: "topic not found"
      });
      return;
    }
    data.unit = lesson.length + 1;
    return;
    lessonRepo.insert(data).then(value => {
      res.status(200);
      res.json({
        success: true,
        value: data
      });
      //console.log(util.inspect(data, {showHidden: false, depth: null}))

      var queryTopic = {
        "_id": new ObjectId(topicId)
      };
      topicRepo.update(queryTopic, {
        $push: {
          lessons: {
            _id: data._id,
            title: data.title,
          }
        }
      });
      categoryRepo.update({
        "_id": new ObjectId(categoryId),
        "topics._id": new ObjectId(topicId)
      }, {
        $push: {
          'topics.$.lessons': {
            _id: data._id,
            title: data.title,
          }
        }
      });

    }).catch(err => {
      res.status(400);
      res.json({
        success: false,
        message: err.err
      });
    });
  });

}

function update(req, res) {

  var lessonId = req.swagger.params.lessonId.value;
  var body = req.swagger.params.body.value;
  var content = body.content;
  var categoryIdNew = body.categoryId;
  var topicIdNew = body.topicId;
  var titleNew = body.title;
  var milestone = body.milestone;
  var estTime = body.estTime;
  var unit = body.unit;
  
  var data = {
    content: content,
    categoryId: categoryIdNew,
    topicId: topicIdNew,
    title: titleNew,
    milestone: milestone,
    estTime: estTime,
    unit: unit
  }
  //console.log(util.inspect(data, {showHidden: false, depth: null}))
  var query = {
    "_id": new ObjectId(lessonId)
  };
  var queryTopicNew = {
    "_id": new ObjectId(topicIdNew)
  };
  var queryCategoryNew = {
    "_id": new ObjectId(categoryIdNew)
  };

  const lessonFound = lessonRepo.findOne(query);
  const topicFound = topicRepo.findOne(queryTopicNew);
  const categoryFound = categoryRepo.findOne(queryCategoryNew);

  Promise.all([lessonFound, topicFound, categoryFound]).then(([lesson, topic, category]) => {

    if (!lesson) {
      res.status(400);
      res.json({
        success: false,
        message: "lesson not found"
      });
      return;
    }
    if (!topic) {
      res.status(400);
      res.json({
        success: false,
        message: "topic not found"
      });
      return;
    }
    if (!category) {
      res.status(400);
      res.json({
        success: false,
        message: "category not found"
      });
      return;
    }
    if (!category._id.equals(topic.categoryId)) {
      res.status(400);
      res.json({
        success: false,
        message: "topic not found in category"
      });
      return;
    }

    lessonRepo.update(query, data).then(value => {
      if (lesson.topicId !== topicIdNew) {
        var queryTopicOld = {
          "_id": new ObjectId(lesson.topicId)
        };
        var queryCategoryOld = {
          "_id": new ObjectId(lesson.categoryId)
        };

        topicRepo.update(queryTopicOld, {
          $pull: {
            lessons: {
              _id: lesson._id,
              title: lesson.title,
            }
          }
        });
        topicRepo.update(queryTopicNew, {
          $push: {
            lessons: {
              _id: lesson._id,
              title: titleNew,
            }
          }
        });
        categoryRepo.update({
          "_id": new ObjectId(lesson.categoryId),
          "topics._id": new ObjectId(lesson.topicId)
        }, {
          $pull: {
            'topics.$.lessons': {
              _id: lesson._id
            }
          }
        });
        categoryRepo.update({
          "_id": new ObjectId(categoryIdNew),
          "topics._id": new ObjectId(topicIdNew)
        }, {
          $push: {
            'topics.$.lessons': {
              _id: lesson._id,
              title: data.title,
            }
          }
        });
      } else {
        var queryTopicUpdate = {
          "lessons._id": lesson._id
        };
        topicRepo.update(queryTopicUpdate, {
          $set: {
            "lessons.$.title": titleNew,
          }
        });

        categoryRepo.update({
          "_id": new ObjectId(lesson.categoryId),
          "topics._id": new ObjectId(lesson.topicId)
        }, {
          $pull: {
            'topics.$.lessons': {
              _id: lesson._id
            }
          }
        });
        categoryRepo.update({
          "_id": new ObjectId(categoryIdNew),
          "topics._id": new ObjectId(topicIdNew)
        }, {
          $push: {
            'topics.$.lessons': {
              _id: lesson._id,
              title: data.title,
            }
          }
        });
      }
      res.status(200);
      res.json({
        success: true,
        value: data
      });
      return;
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
}

function deleteLesson(req, res) {
  var lessonId = req.swagger.params.lessonId.value.trim();
  lessonRepo.findOne({_id: new ObjectId(lessonId)}).then(result => {
    if(result) {
      var lesson = result;
      var categoryId =  result.categoryId;
      var topicId =  result.topicId;
      var lessonExcute = lessonRepo.delete({_id: new ObjectId(lessonId)});
      var topicExcute = topicRepo.update({_id: new ObjectId(topicId)}, {
        $pull: {
          lessons: {
            _id: lesson._id,
            title: lesson.title,
          }
        }
      });
      var categoryExcute = categoryRepo.update({
        "_id": new ObjectId(categoryId),
        "topics._id": new ObjectId(topicId)
      }, {
        $pull: {
          'topics.$.lessons': {
            _id: lesson._id
          }
        }
      });
      Promise.all([lessonExcute, topicExcute, categoryExcute]).then(([lesson, topic, category]) => {
        res.status(200);
        res.json({
            success: true,
            message: 'Deleted successfully'
        });
      });

    } else {
      res.status(400);
      res.json({
        success: false,
        message: "lesson not found"
      });
    }
  }).catch(err => {
    res.status(400);
    res.json({
      success: false,
      message: err.err
    });
  })
  
}
