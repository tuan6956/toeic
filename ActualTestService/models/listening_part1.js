const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;

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
    console.log(id)
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

module.exports = {
    importQuestion,
    getAll,
    getQuestionById
}