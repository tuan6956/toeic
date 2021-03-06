'use strict';
var util = require('util');
const questionFunction = require('../../models/question.js');
const { ObjectId } = require('mongodb');
const { OrderedMap } = require('immutable');
const helpers = require('../../helpers/helpers.js');
const  sha256 = require('js-sha256');
module.exports = {
    getListQuestionsOfLesson: getListQuestionsOfLesson,
    insertChoiceQuestionIntoLesson: insertChoiceQuestionIntoLesson,
    updateChoiceQuestionOfLesson: updateChoiceQuestionOfLesson,
    insertFillQuestionIntoLesson: insertFillQuestionIntoLesson,
    updateFillQuestionOfLesson: updateFillQuestionOfLesson,   
    verifyAnswer: verifyAnswer,
    getResultExerciseOfLesson: getResultExerciseOfLesson,
    removeAllSession: removeAllSession,
    getChoiceQuestion: getChoiceQuestion,
    getFillQuestion: getFillQuestion,
    getAllQuestion: getAllQuestion
};

function getAllQuestion(req, res) {
    const db = req.app.db;
    var listChoiceQuestions = [];
    var listFillQuestions = [];
    Promise.all([
        questionFunction.findAll(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, {}).then((result) => {
            // console.log('choice question')
            // console.log(result)
            for(var i = 0; i < result.length; i++){
                result[i].type = helpers.TYPE_CHOICE_QUESTION;
            }
            listChoiceQuestions = result;
        }).catch((err) => {
             console.log(err)
        }),
        questionFunction.findAll(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, {}).then((result) => {
            // console('fill question')
            for(var i = 0; i < result.length; i++){
                result[i].type = helpers.TYPE_FILL_QUESTION;
            }
            listFillQuestions = result;;
        }).catch((err) => {
            console.log(err);
        })]
    ).then((result) => {
        var listQuestion = listChoiceQuestions.concat(listFillQuestions);
        listQuestion = listQuestion.sort(()=>{
            return Math.random() - 0.5;
        })
        res.status(200);
        res.json({
            listQuestion: listQuestion
        });
        return;
    })
}

function insertUser(users, userId, session, object){
    var mapSession = users.getUser(userId);
    if(mapSession){
        mapSession = mapSession.set(session, object);
        users.insertUser(userId, mapSession);
    }else{
        var mapSession = new OrderedMap();
        mapSession = mapSession.set(session, object);
        users.insertUser(userId, mapSession);
    }
}

function getChoiceQuestion(req, res) {
    const db = req.app.db;
    const choiceQuestionId = ObjectId(req.swagger.params.choice_question_id.value);
    questionFunction.findOneDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, {_id: ObjectId(choiceQuestionId)}).then((result) => {
        // console.log(result);
        res.status(200);
        res.json({
            question: result
        });
        return;
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The question is not existed"
        })
        return;
    })
}

function getFillQuestion(req, res) {
    const db = req.app.db;
    const fillQuestionId = ObjectId(req.swagger.params.fill_question_id.value);
    questionFunction.findOneDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, {_id: ObjectId(fillQuestionId)}).then((result) => {
        res.status(200);
            res.json({
                question: result
            });
        // var listQuestion = listChoiceQuestions.concat(listFillQuestions);
        // listQuestion = listQuestion.sort(()=>{
        //     return Math.random() - 0.5;
        // })
        // res.status(200);
        // res.json({
        //     session: session,
        //     listQuestion: listQuestion
        // });
        return;
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The question is not existed"
        })
        return;
    })
}

function getListQuestionsOfLesson(req, res){
    const lessonId = ObjectId(req.swagger.params.lessonId.value);
    var numberQuestion = req.swagger.params.numberQuestion.value;
    const db = req.app.db;
    const userId = req.email;
    //get list choice question in db
    if(numberQuestion < helpers.NUMBERQUESTION_LESSON || numberQuestion <= 1){
        numberQuestion = helpers.NUMBERQUESTION_LESSON;
    }

    var rand = Math.floor(Math.random() * (numberQuestion - 1)) + 1;
    var listChoiceQuestions = [];
    var listFillQuestions = [];
    
    //add user vao listUser.
    const object = {
        numberQuestion: numberQuestion,
        questionId: '',
        numberAnswer: 0,
        numberAnswerRight: 0,
        timeAnswer: 0,
        listQuestionId: []
    }
    const date = new Date();
    const time = date.getTime();
    const session = sha256(time.toString() + userId);
    insertUser(req.app.users, userId, session, object);

    const queryChoiceQuesion = [
        {
            $match:{
                lessonId: lessonId
            }
        },
        {
            $sample: {
                size: rand
            }
        },
        {
            $project:{
                _id: true,
                content: true,
                answers: true,
                answerRight: true,
                explainRight: true
            },
        }
    ]

    const queryFillQuesion = [
        {
            $match:{
                lessonId: lessonId
            }
        },
        {
            $sample: {
                size: numberQuestion - rand
            }
        },
        {
            $project:{
                _id: true,
                content: true,
                answers: true
            },
        }
    ]

    questionFunction.findOneDB(db, helpers.NAME_DB_LESSONS, {_id: ObjectId(lessonId)}).then((result) => {
        Promise.all([
            questionFunction.aggregateDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, queryChoiceQuesion).then((result) => {
                // console.log('choice question')
                // console.log(result)
                for(var i = 0; i < result.length; i++){
                    result[i].type = helpers.TYPE_CHOICE_QUESTION;
                }
                listChoiceQuestions = result;
            }).catch((err) => {
                 console.log("errr")
                // console.log(err);
                // res.status(400);
                // res.json({
                //     message: err
                // })
            }),
            questionFunction.aggregateDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, queryFillQuesion).then((result) => {
                // console('fill question')
                for(var i = 0; i < result.length; i++){
                    result[i].type = helpers.TYPE_FILL_QUESTION;
                }
                listFillQuestions = result;;
            }).catch((err) => {
                // console.log('error fill question')
                console.log(err);
                // res.status(400);
                // res.json({
                //     message: err
                // })
                //return;
            })]
        ).then((result) => {

            listChoiceQuestions = listChoiceQuestions.map(item=>{
                item.question_content = item.content;
                item.right_answer = item.answerRight;
                delete item.answerRight;
                delete item.content;
                return item;
            })

            let questions = {
                part_1: [],
                part_2: [],
                part_3: [],
                part_4: [],
                part_5: [],
                part_6: [],
                part_7: {
                    type_1: [],
                    type_2: []
                }
            }
            questions.part_5 = questions.part_5.concat(listChoiceQuestions);
            questions.part_5 = questions.part_5.sort(()=>{
                return Math.random() - 0.5;
            })
            var isExercise = listChoiceQuestions.length != 0;
            res.status(200);
            res.json({
                session: session,
                questions: questions,
                isExercise: isExercise
            });
            return;
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The lesson is not existed"
        })
        return;
    })
    
}

function insertChoiceQuestionIntoLesson(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataChoiceQuestion(bodyTmp);


    if(body.content.length === 0 || body.answer === '' || !checkAnswerOfChoiceQuestionRequest(body.answers) 
    || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    questionFunction.findOneDB(db, helpers.NAME_DB_LESSONS, {_id: body.lessonId}).then((result) => {
        //check content question existed in db
        questionFunction.findOneDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, body).then((result) => {
                res.status(200);
                res.json({
                    message: "insert choice question into database successed"
                })
            }).catch((err) => {
                res.status(400);
                res.json({
                    message: "insert choice question into database failed"
                })
            })
        }) 
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The lesson is not existed"
        })
    })
}

function updateChoiceQuestionOfLesson(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataChoiceQuestion(bodyTmp);
    body.id = ObjectId(bodyTmp.id.trim());

    if(body.content.length === 0 || body.answer === '' || !checkAnswerOfChoiceQuestionRequest(body.answers) 
    || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    questionFunction.findOneDB(db, helpers.NAME_DB_LESSONS, {_id: body.lessonId}).then((result) => {
        //update
        var update = {
            $set: {
                lessonId: body.lessonId,
                content: body.content,
                answers: body.answers,
                answerRight: body.answerRight,
                explainRight: body.explainRight,
                suggest: body.suggest
            }
        }

        questionFunction.findOneAndUpdateDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, {_id: body.id}, update).then((result) => {
            res.status(200);
            res.json({
                message: "Update choice quesion successed"
            })
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Update choice question failed"
            })
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The lesson is not existed"
        })
    })
}

function insertFillQuestionIntoLesson(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataFillQuestion(bodyTmp);

    if(body.content.length === 0 || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }
    questionFunction.findOneDB(db, helpers.NAME_DB_LESSONS, {_id: ObjectId(body.lessonId)}).then((result) => {
        //check content question existed in db
        questionFunction.findOneDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, body).then((result) => {
                res.status(200);
                res.json({
                    message: "insert fill question into database successed"
                })
            }).catch((err) => {
                res.status(400);
                res.json({
                    message: "insert fill question into database failed"
                })
            })
        }) 
    }).catch((err) => {
        console.log('err: ', err);
        res.status(400);
        res.json({
            message: "The lesson is not existed"
        })
    })

}

function updateFillQuestionOfLesson(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataFillQuestion(bodyTmp);
    body.id = ObjectId(bodyTmp.id.trim());

    if(body.content.length === 0 || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    questionFunction.findOneDB(db, helpers.NAME_DB_LESSONS, {_id: body.lessonId}).then((result) => {
        //update
        var update = {
            $set: {
                lessonId: body.lessonId,
                content: body.content,
                answerRight: body.answerRight,
                explainRight: body.explainRight,
                suggest: body.suggest
            }
        }

        questionFunction.findOneAndUpdateDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, {_id: body.id}, update).then((result) => {
            res.status(200);
            res.json({
                message: "Update fill quesion successed"
            })
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Update fill question failed"
            })
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The lesson is not existed"
        })
    })
}

function verifyAnswer(req, res){
    const questionId = req.swagger.params.questionId.value;
    const session = req.swagger.params.session.value;
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handleDataAnswer(bodyTmp);
    const userId = req.userId;

    var mapSession = req.app.users.getUser(userId);
    if(!mapSession){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return;
    }

    var sessionObject =  mapSession.get(session);

    if(!sessionObject){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return; 
    }
    const index = sessionObject.listQuestionId.indexOf(questionId);
    if(index >= 0 && index < sessionObject.listQuestionId.length - 1){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return; 
    }

    if(body.typeQuestion === helpers.TYPE_CHOICE_QUESTION && body.answer.length !== 0){
        handleAnswerQuestion(res, db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, sessionObject, questionId, body.answer);
    }else if(body.typeQuestion === helpers.TYPE_FILL_QUESTION && body.answer.length !== 0){
        handleAnswerQuestion(res, db, helpers.NAME_DB_FILLQUESTION_EXERCISE, sessionObject, questionId, body.answer);
    }else{
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return;
    }
}

function getResultExerciseOfLesson(req, res){
    const session = req.swagger.params.session.value;
    const userId = req.userId;
    const db = req.app.db;
    var mapSession = req.app.users.getUser(userId);
    var sessionObject = mapSession.get(session);
    
    const option = {
        fields: {
            pointReward: 1
        }
    }
    questionFunction.findOneDB(db, helpers.NAME_DB_USERS, {_id: ObjectId(userId)}, option).then((result) => {
        const point = result.pointReward + sessionObject.numberAnswerRight * helpers.POINT_BASE;
        var update = {
            $set:{
                pointReward: point
            }
        }
        questionFunction.findOneAndUpdateDB(db, helpers.NAME_DB_USERS, {_id: ObjectId(userId)}, update).then((result) => {
            if(sessionObject.numberQuestion === sessionObject.numberAnswer){
                mapSession = mapSession.remove(session);
                req.app.users.insertUser(userId, mapSession);
                res.status(200);
                res.json({
                    numberQuestion: sessionObject.numberQuestion,
                    numberAnswerRight: sessionObject.numberAnswerRight,
                    point: sessionObject.numberAnswerRight * helpers.POINT_BASE
                })
            }else{
                res.status(400);
                res.json({
                    message: "Invalid the request. Number answer not equal number question"
                })
            }
        }).catch((err) => {
            res.status(400);
            res.json({
                message: err
            })
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: err
        })
    })
}

function removeAllSession(req, res){
    const userId = req.userId;
    const body = req.swagger.params.body.value;
    const listSession = body.listSession;
    var mapSession = req.app.users.getUser(userId);

    listSession.forEach(element => {
        mapSession = mapSession.remove(element);
    });

    req.app.users.insertUser(userId, mapSession);

    console.log(req.app.users.getUser(userId));

    res.status(200);
    res.json({
        message: "Remove all session success"
    })
}

function checkAnswerOfChoiceQuestionRequest(answers){
    if(answers.optA.length === 0 || answers.optB.length === 0 || answers.optC.length === 0 || answers.optD.length === 0){
        return false;
    }
    return true;
}

function handlerDataChoiceQuestion(data){
    var body = {};
    body.answers = {};

    body.lessonId = ObjectId(data.lessonId.trim());
    body.content = data.content.trim();
    body.answers.optA = data.answers.optA.trim();
    body.answers.optB = data.answers.optB.trim();
    body.answers.optC = data.answers.optC.trim();
    body.answers.optD = data.answers.optD.trim();
    body.answerRight = data.answerRight.trim();
    body.explainRight = data.explainRight.trim();
    body.suggest = data.suggest.trim();
    return body;
}

function handlerDataFillQuestion(data){
    var body = {};

    body.lessonId = ObjectId(data.lessonId.trim());
    body.content = data.content.trim()
    body.answerRight = data.answerRight.trim();
    body.explainRight = data.explainRight.trim();
    body.suggest = data.suggest.trim();
    return body;
}

function handleDataAnswer(data){
    var body = {};

    body.typeQuestion = data.typeQuestion.trim();
    body.answer = data.answer.trim();
    return body;
}

function handleAnswerQuestion(res, db, nameCollection, sessionObject, questionId, answer){
    var option = {
        fields: {
            answerRight: 1,
            explainRight: 1,
            suggest: 1,
        }
    }
    questionFunction.findOneDB(db, nameCollection, {_id: ObjectId(questionId)}, option).then((result) => {
        if(result.answerRight === answer){
            if(sessionObject.questionId !== questionId && (sessionObject.numberAnswer < sessionObject.numberQuestion)){
                sessionObject.listQuestionId.push(questionId);
                sessionObject.questionId = questionId;
                sessionObject.numberAnswer = sessionObject.numberAnswer + 1;
                sessionObject.numberAnswerRight = sessionObject.numberAnswerRight + 1;
                sessionObject.timeAnswer = helpers.TIMEANSWER;
                res.status(200);
                res.json({
                    result: true,
                    record: result.explainRight
                })
            }else if(sessionObject.timeAnswer < helpers.TIMEANSWER){
                sessionObject.timeAnswer = sessionObject.timeAnswer + 1;
                res.status(200);
                res.json({
                    result: true,
                    record: result.explainRight
                })
            }else{
                res.status(400);
                res.json({
                    message: "Invalid the request. Too many answers"
                })
            }
        }else{
            if(sessionObject.questionId !== questionId){
                sessionObject.listQuestionId.push(questionId);
                sessionObject.questionId = questionId;
                sessionObject.numberAnswer = sessionObject.numberAnswer + 1;
                sessionObject.timeAnswer = 1;
                res.status(200);
                res.json({
                    result: false,
                    record: result.suggest
                })
            }else if(sessionObject.timeAnswer < helpers.TIMEANSWER){
                sessionObject.timeAnswer = sessionObject.timeAnswer + 1;
                res.status(200);
                res.json({
                    result: false,
                    record: result.answerRight
                })
            }else{
                res.status(400);
                res.json({
                    message: "Invalid the request. Too many answers"
                })
            }
        } 
    }).catch((err) => {
        res.status(400);
        res.json({
            message: "Not found answer"
        })
    })
}
