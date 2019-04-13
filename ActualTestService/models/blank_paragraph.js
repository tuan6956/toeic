const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;

const importBlankParagraph = (data) => {
    const d = q.defer();
    const {
        
    } = data;

    dbController.insert(collections.blank_paragraph, data)
                .then(result => {
                    delete result.list_options;
                    delete result.list_right_answers;
                    d.resolve(result);
                })
                .catch(err => {
                    d.reject({
                        status: 500,
                        message: "Can not insert paragraph into database"
                    });
                })
    return d.promise;
}

module.exports = {
    importBlankParagraph
}