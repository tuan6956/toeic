const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;

const importQuestionPart6Array = (data) => {
    const d = q.defer();
    const {
        
    } = data;

    dbController.insert(collections.blank_paragraph, data)
                .then(result => {
                    d.resolve(result);
                })
                .catch(err => {
                    d.reject({
                        status: 500,
                        message: "Can not insert question array into database"
                    });
                })
    return d.promise;
}


module.exports = {
    importQuestionPart6Array
}