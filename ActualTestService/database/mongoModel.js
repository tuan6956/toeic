
import MongoConnector from '../middlewares/mongo_connector';
const nameDB = require('../configs/db').name;
const q = require('q');

var mongoConect = new MongoConnector();

export default class MongoModel {
    constructor(app){
        this.app = app;
    }

    findRecord(collection, find_data){
        const d = q.defer();
        this.app.db.collection(collection)
                .find(find_data)
                .toArray((error, result) => {
                    error ? d.reject(error) : d.resolve(result);
                    // client.close();
                });
    
        return d.promise;
    };
    
    insertRecord(collection, data){
        const d = q.defer();
        this.app.db.collection(collection)
                .insertOne(data, (error, result) => {
                    error ? d.reject(error) : d.resolve(result.ops[0]);
                    // client.close();
                });
        
        return d.promise;
    };
    
    updateRecord(collection, query, data){
        const d = q.defer();
        this.app.db.collection(collection)
                .findOneAndUpdate(
                    query, 
                    { $set: data }, 
                    { returnOriginal:false },
                    (error, result) => {
                        error ? d.reject(error) : d.resolve(result.value);
                    }
                );

        // this.app.db.collection(collection)
        //             .updateOne(query, 
        //             { $set: data }, 
        //             { returnOriginal:false },
        //             (error, result) => {
        //                 console.log(result.result)
        //                 error ? d.reject(error) : d.resolve(result.value);
        //             }
        //         );

        return d.promise;
    }
    
    deleteRecord(collection, query){
        const d = q.defer();
        this.app.db.collection(collection)
                .deleteMany(query, (error, result) => {
                    error ? d.reject(error) : d.resolve(result);
                    // client.close();
                });
    
        return d.promise;
    }
    
    getAll(collection, page, limit, querry = {}, option = {}){
        const d = q.defer();
        // this.app.db.collection(collection).aggregate(querry)
        //         .sort({time:-1})
        //         .skip(+page).limit(+limit)
        //         .toArray((error, result) => {
        //             error ? d.reject(error) : d.resolve(result);
        //         });
        this.app.db.collection(collection)
                .find(querry, option)
                .sort({time:-1})
                .skip(+page).limit(+limit)
                .toArray((error, result) => {
                    error ? d.reject(error) : d.resolve(result);
                });
    
        return d.promise;
    }

    aggregate_func(collection, querry) {
     const d = q.defer();
        this.app.db.collection(collection).aggregate(querry)
                .toArray((error, result) => {
                    error ? d.reject(error) : d.resolve(result);
                });
    
        return d.promise;   
    }
}