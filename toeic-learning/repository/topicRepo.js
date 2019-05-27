var db = require('../database/mongo');
var config = require('../config/db');
var util = require('util');

const collection = config.DATABASE_COLLECTION_TOPIC;

exports.insert = data => {
    return db.insert(data, collection);
}

exports.update = (query, dataNew) => {
    return db.update(query, dataNew, collection);
}

exports.findOne = query => {
    return db.findOne(query, collection);
}

exports.getAll = (limit, skip) => {
    return db.get({}, collection, limit, skip);
}

exports.delete = query => {
    return db.delete(query, collection);
}