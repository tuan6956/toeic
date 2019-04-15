const bcrypt = require('bcrypt');
const q = require('q');
const jwt = require('jsonwebtoken');
const configJWT = require('../configs/jwt');

const comparePassword = (plainPass, hashPass) => {
    const d = q.defer();
    bcrypt.compare(plainPass, hashPass, (err, isPasswordMatch) => {
        err ? d.reject(err) : d.resolve(isPasswordMatch);
    });
    return d.promise;
};

const cryptPassword = (password) => {

    const d = q.defer();
    console.log(password);
    
    bcrypt.genSalt(15, (error, salt) => {
    
        if (error) {
            d.reject(error);
        } else {

            bcrypt.hash(password, salt, (error, hash) => {
                error ? d.reject(error) : d.resolve(hash);
            });
        }

    });

    return d.promise;
}

const generateToken = (payload, secret, expiresTime) => {
    const d = q.defer();

    jwt.sign(payload, secret, {
        expiresIn: expiresTime
    }, (error, token) => {
        error ? d.reject(error) : d.resolve(token);
    });

    return d.promise;
}

const verifyToken = (token) => {
    const d = q.defer();

    jwt.verify(token, configJWT.secret.accessToken, (error, payload) => {
        payload ? d.resolve(payload) : d.resolve('');
    })

    return d.promise;
}

module.exports = {
    comparePassword,
    cryptPassword,
    generateToken,
    verifyToken
}
