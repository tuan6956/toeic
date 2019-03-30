const configDB = require('../configs/db');
const mongoClient = require('mongodb').MongoClient;

let connectDB = (callback) => {
    mongoClient.connect(configDB.url, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return callback(err, null)
        } else {
            return callback(null, client)
        }
    })
}

module.exports = {
    connectDB
}
