const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;

    const importQuestionsPart7 = (data) => {
    const d = q.defer();
    const {
        
    } = data;

    dbController.insert(collections.question_of_part7, data)
                .then(result => {
                    delete result.question_content;
                    delete result.right_answer;
                    delete result.answers;
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


module.exports = {
    importQuestionsPart7
}