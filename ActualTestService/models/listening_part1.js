const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');

const importQuestion = (data) => {
    const d = q.defer();
    const {
        image_link,
        anwsers,
        right_anwser,
        level,
        part
    } = data;

    dbController.insert(collections.listening_question_part1, data)
                .then(result => {
                    delete result.image_link;
                    delete result.answers;
                    delete result.right_answer;
                    delete result.explain;
                    d.resolve(result);
                })
                .catch(err => {
                    d.reject({
                        status: 500,
                        message: "Can not insert question into database"
                    });
                })
    return d.promise;
}

const getAll = (page = 0, limit = 5) => {
    const d = q.defer();

    dbController.getAll(collections.listening_question_part1, page, limit)
                .then(result => {
                    d.resolve(result);
                })
                .catch(err => {
                    d.reject({
                        status: 500,
                        message: "Can not get all question into database"
                    });
                })
    return d.promise;
}

const getQuestionById = (id) => {
    const d = q.defer();

    dbController.find(collections.listening_question_part1, id)
                .then(result => {
                    console.log(result)
                    d.resolve(result);
                })
                .catch(err => {
                    d.reject({
                        status: 500,
                        message: "Can not get all question into database"
                    });
                })
    return d.promise;
}

const updateQuestionById = (_id, data) => {
    _id = ObjectId(_id);

    let data_update = new Object();
    let answers = _.get(data, 'answers')
    if(answers){
        if(answers.optA){
            data_update['answers.optA'] = answers.optA;
        }
        if(answers.optB){
            data_update['answers.optB'] = answers.optB;
        }
        if(answers.optC){
            data_update['answers.optC'] = answers.optC;
        }
        if(answers.optD){
            data_update['answers.optD'] = answers.optD;
        }
        
    }
    else{data_update = data}
    console.log(data_update)
    const d = q.defer();

    dbController.update(collections.listening_question_part1, _id, data_update)
                .then(result => {
                    d.resolve(result);
                })
                .catch(err => {
                    d.reject({
                        status: 500,
                        message: "Can not update question into database"
                    });
                })
    return d.promise;
}

module.exports = {
    importQuestion,
    getAll,
    getQuestionById,
    updateQuestionById
}