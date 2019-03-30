const q = require('q');
const { verifyToken } = require('./auth');
const { dbController } = require('../database/index');
const userCollection = require('../configs/db').collections.user;

const checkAccessToken = (accessToken) => {
    const d = q.defer();

    verifyToken(accessToken)
        .then(payload => {
            return dbController.find(userCollection, {
                email: payload ? payload.email : ''
            })
        })
        .then(user => {
            if (user.length > 0) {
                d.resolve({
                    email: user[0].email,
                    role: user[0].role
                });
            }
            else {
                d.reject({
                    status: 402,
                    message: 'AccessToken is not valid'
                })
            }
        })
        .catch(error => {
            d.reject({
                status: 500,
                message: 'AccessToken is not valid'
            });
        });

    return d.promise;
}

module.exports = {
    checkAccessToken
}
