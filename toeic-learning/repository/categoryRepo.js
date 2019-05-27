var db = require('../database/mongo');
var config = require('../config/db');

const collection = config.DATABASE_COLLECTION_CATEGORY;

exports.insert = data => {
    return db.insert(data, collection);
}

exports.update = (data, dataNew) => {
    return db.update(data, dataNew, collection);
}

exports.findOne = data => {
    return db.findOne(data, collection);
}

exports.getAll = (limit, skip) => {
    return db.get({}, collection, limit, skip);
}

exports.delete = query => {
    return db.delete(query, collection);
}