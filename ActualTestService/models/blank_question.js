const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;

export default class BlankQuestion {

    getAll(page = 0, limit = 5){
        const d = q.defer();
    
        dbController.getAll(collections.blank_question, page, limit)
                    .then(result => {
                        console.log(result);
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
    
    importBlankQuestion(data){
        const d = q.defer();
        const {
            content,
            pos,
            anwsers,
            right_anwser,
            level,
            part
        } = data;

        dbController.insert(collections.blank_question, data)
                    .then(result => {
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
}