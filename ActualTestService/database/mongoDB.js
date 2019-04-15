const { connectDB } = require('../middlewares/db');
const nameDB = require('../configs/db').name;
const q = require('q');

const findRecord = (collection, find_data) => {
    const d = q.defer();
    connectDB((error, client) => {
        if (error) throw error;
        const db = client.db(nameDB);
        db.collection(collection)
            .find(find_data)
            .toArray((error, result) => {
                error ? d.reject(error) : d.resolve(result);
                client.close();
            });
    });

    return d.promise;
};

const insertRecord = (collection, data) => {
    const d = q.defer();
    connectDB((error, client) => {
        if (error) throw error;
        const db = client.db(nameDB);
        db.collection(collection)
            .insertOne(data, (error, result) => {
                error ? d.reject(error) : d.resolve(result.ops[0]);
                client.close();
            });
    });
    
    return d.promise;
};

const updateRecord = (collection, query, data) => {
    const d = q.defer();
    connectDB((error, client) => {
        if (error) throw error;
        const db = client.db(nameDB);
        db.collection(collection)
            .findOneAndUpdate(
                query, 
                { $set: data }, 
                { returnOriginal:false },
                (error, result) => {
                    error ? d.reject(error) : d.resolve(result.value);
                    client.close();
                }
            );
    });

    return d.promise;
}

const deleteRecord = (collection, query) => {
    const d = q.defer();
    connectDB((error, client) => {
        if (error) throw error;
        const db = client.db(nameDB);
        db.collection(collection)
            .deleteMany(query, (error, result) => {
                error ? d.reject(error) : d.resolve(result);
                client.close();
            });
    });

    return d.promise;
}

const getAll = (collection, page, limit, data_fillter) => {
    const d = q.defer();
    connectDB((error, client) => {
        if (error) throw error;
        const db = client.db(nameDB);
        db.collection(collection)
            .find(data_fillter)
            .sort({time:-1})
            .skip(+page).limit(+limit)
            .toArray((error, result) => {
                error ? d.reject(error) : d.resolve(result);
                client.close();
            });
    });

    return d.promise;
}

module.exports = {
    find: findRecord,
    insert: insertRecord,
    update: updateRecord,
    delete: deleteRecord,
    getAll: getAll
}