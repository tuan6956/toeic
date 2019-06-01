var db = require('../database/mongo');
var config = require('../config/db');

const collection = config.DATABASE_COLLECTION_HISTORY;

exports.insert = data => {
    return db.insert(data, collection);
}

exports.update = (query, dataNew) => {
    return db.update(query, dataNew, collection);
}

exports.findOne = query => {
    return db.findOne(query, collection);
}

exports.getAll = (obj, limit, skip) => {
    return db.getExclude(obj,{content: 0}, collection, limit, skip);
}

exports.delete = query => {
    return db.delete(query, collection);
}