var db = require('../database/mongo');
var config = require('../config/db');
var util = require('util');

const collection = config.DATABASE_COLLECTION_VOCABULARY;

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

exports.findVocType = (type) => {
    return db.findOne(type, config.DATABASE_COLLECTION_VOCABULARY_TYPE);
}

exports.addVocType = data => {
    return db.insert(data, config.DATABASE_COLLECTION_VOCABULARY_TYPE);
}

exports.getType = (limit) => {
    const queryGet = [
        {
            $sample: {
                size: limit
            }
        }
    ]
    return db.aggregate(queryGet, config.DATABASE_COLLECTION_VOCABULARY_TYPE);
}

exports.getRandomByType = (type, size) => {
    const queryGet = [
        {
            $match:{
                type: type
            }
        },
        {
            $sample: {
                size: size
            }
        }
    ]
    return db.aggregate(queryGet, collection);
}