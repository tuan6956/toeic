const configDB = require('../configs/db');
const mongoClient = require('mongodb').MongoClient;

export default class MongoConnector {
    // connectDB(callback){
    //     mongoClient.connect(configDB.url, { useNewUrlParser: true }, (err, client) => {
    //         if (err) {
    //             return callback(err, null)
    //         } else {
    //             return callback(null, client)
    //         }
    //     })
    // }
    connectDB() {
        return new Promise((resolve, reject) => {
            mongoClient.connect(configDB.url, configDB.option, (err, client) => {
                const db = client.db(configDB.name);
                err ? reject(err) : resolve(db);
            });
        })
    }

}