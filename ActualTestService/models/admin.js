const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
const configJWT = require('../configs/jwt');
var ObjectId = require('mongodb').ObjectID;
const adminRole = 'admin';
const {
    comparePassword,
    cryptPassword,
    generateToken
} = require('../utils/auth')

const login = (info) => {
    const d = q.defer();
    var {
        email,
        password
    } = info;
    var role = '';
    var match = email.trim().match(/^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/);
    if (match === null) {
        d.reject({
            status: 412,
            message: "Email was wrong format"
        });
        return d.promise;
    }
    email = email + "_" + adminRole;
    dbController.find(collections.user, {
        email
    })
        .then(result => {
            if (result.length) {
                if (result[0].role != adminRole) {
                    return false;
                }
                role = adminRole;
                return comparePassword(password, result[0].password);
            }
            return false;
        })
        .then(match => {
            if (match) {
                let accessTokenPromise = generateToken({
                    email,
                    role
                }, configJWT.secret.accessToken, configJWT.expires.accessToken);
                let refreshTokenPromise = generateToken({
                    email,
                    role
                }, configJWT.secret.refreshToken, configJWT.expires.refreshToken);

                q.all([accessTokenPromise, refreshTokenPromise])
                    .then(([accessToken, refreshToken]) => {
                        const da = q.defer();
                        d.resolve({
                            accessToken,
                            refreshToken,
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        d.reject({
                            status: 500,
                            message: 'Error undefind'
                        });
                    })
            } else {
                d.reject({
                    status: 401,
                    message: 'Email or password wrong'
                });
            }
        })
        .catch(error => {
            d.reject({
                status: 401,
                message: 'Account can not be found'
            });
        });

    return d.promise;
}

const register = (info) => {
    info.role = adminRole;
    const d = q.defer();
    let current_user = {};
    var match = info.email.trim().match(/^(09|03|05|07|08)+([0-9]{8})\b/);
    if (match === null) {
        d.reject({
            status: 412,
            message: "Email number was wrong format"
        });
        return d.promise;
    }
    info.email = info.email + "_" + adminRole;
    
    dbController.find(collections.user, {
        email: info.email
    })
        .then(user => {
            var isExists = false;
            if (user.length) {
                isExists = true;
            }
            if (!isExists) {
                cryptPassword(info.password)
                    .then(result => {
                        current_user = {
                            ...info,
                            password: result,

                        };
                        return dbController.insert(collections.user, current_user);
                    })
                    .then(result => {
                        delete result.password;
                        delete result.role;

                        result.status = 200;
                        d.resolve(result);
                    })
                    .catch(error => {
                        d.reject({
                            status: 500,
                            message: "Can not insert account into database"
                        });
                    })
            } else {
                d.reject({
                    status: 401,
                    message: "This email already existed"
                });
            }
        })
        .catch(error => {
            d.reject({
                status: 500,
                message: "Account can not be found"
            });
        });

    return d.promise;
}

module.exports = {
    login,
    register,
}
