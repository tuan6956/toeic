const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
var ObjectId = require('mongodb').ObjectID;

const importParagraphPart7 = (data) => {
    const d = q.defer();
    const {
        
    } = data;

    dbController.insert(collections.paragraphs_of_part7, data)
                .then(result => {
                    delete result.paragraphs;
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
    importParagraphPart7
}