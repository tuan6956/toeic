const q = require('q');
const { collections } = require('../configs/db');
const { dbController } = require('../database/index');
const configJWT = require('../configs/jwt');
var ObjectId = require('mongodb').ObjectID;
const userRole = 'user'
const {
    comparePassword,
    cryptPassword,
    generateToken
} = require('../utils/auth')

const login = (info) => {
    const d = q.defer();
    const {
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
    dbController.find(collections.user, {
        email
    })
        .then(result => {
            console.log(result);
            if (result.length) {
                role = result[0].role;
                if (role != userRole) {
                    return false;
                }
                return comparePassword(password, result[0].password)
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
    info.role = userRole;
    const d = q.defer();
    let current_user = {};
    var match = info.email.trim().match(/^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/);
    if (match === null) {
        d.reject({
            status: 412,
            message: "Email was wrong format"
        });
        return d.promise;
    }
    dbController.find(collections.user, {
        email: info.email
    })
        .then(user => {
            if (user.length) {
                d.reject({
                    status: 401,
                    message: "This email already existed"
                });
            } else {
                cryptPassword(info.password)
                    .then(result => {
                        current_user = {
                            ...info,
                            password: result,

                        };
                        return dbController.insert(collections.user, current_user);
                    })
                    .then(result => {
                        let accessTokenPromise = generateToken({
                            email: info.email,
                            role: userRole
                        }, configJWT.secret.accessToken, configJWT.expires.accessToken);
                        let refreshTokenPromise = generateToken({
                            email: info.email,
                            role: userRole
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
                    })
                    .catch(error => {
                        console.log(error);
                        d.reject({
                            status: 500,
                            message: "Can not insert account into database"
                        });
                    })
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

const loginFacebook = (info) => {
    const d = q.defer();

    const {
        email,
    } = info
    var role = userRole;
    info.role = role;
    dbController.find(collections.user, {
        email
    })
        .then(result => {
            if (result && result.length) {
                if(result[0].role != userRole) {
                    d.reject({
                        status: 401,
                        message: 'Account can not be found'
                    });
                    return;
                }
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
                            refreshToken
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
                dbController.insert(collections.user, info)
                    .then(value => {
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
                    })
                    .catch(err => {
                        console.log(err)
                        d.reject({
                            status: 500,
                            message: 'Error undefind'
                        });
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

const loginGoogle = (info) => {
    const d = q.defer();

    const {
        email,
    } = info
    var role = userRole;
    info.role = role;

    dbController.find(collections.user, {
        email
    })
        .then(result => {
            if (result && result.length) {
                if(result[0].role != userRole) {
                    d.reject({
                        status: 401,
                        message: 'Account can not be found'
                    });
                    return;
                }
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
                            role
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
                dbController.insert(collections.user, info)
                    .then(value => {
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
                                    role
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                d.reject({
                                    status: 500,
                                    message: 'Error undefind'
                                });
                            })
                    })
                    .catch(err => {
                        console.log(err)
                        d.reject({
                            status: 500,
                            message: 'Error undefind'
                        });
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

const getInfo = (id) => {
    const d = q.defer();

    dbController.find(collections.user, {
        email: id
    }).then(user => {
        console.log(user)
        if (user.length > 0) {
            delete user[0].password;
            delete user[0].role;
            
            d.resolve({
                info: user[0]
            });
        }
        else {
            d.reject({
                status: 403,
                message: 'Access denied!'
            })
        }
    }).catch(error => {
        console.log(error),
            d.reject({
                status: 403,
                message: 'Access denied!'
            });
    });
    return d.promise
}

const updateInfo = (email, info) => {
    const d = q.defer();
    dbController.find(collections.user, {
        email: email
    }).then(user => {
        console.log(user)

        dbController.update(collections.user, {
            email: email
        }, info).then(value => {
            if (value) {
                d.resolve({
                    status: 200,
                    message: 'Update successfull'
                });
            }
            else {
                d.reject({
                    status: 500,
                    message: 'Error undefind!'
                })
            }
        }).catch(error => {
            console.log(error),
                d.reject({
                    status: 500,
                    message: 'Error undefind'
                });
        });
    }).catch(err => {
        console.log(err)
        d.reject({
            status: 401,
            message: 'User not found'
        })
    });
    return d.promise
}

const modifiedToken = (refreshToken, accessToken) => {
    const d = q.defer();
    dbController.update(collections.token, { refreshToken }, { accessToken })
        .then(result => {
            d.resolve(result);
        })
        .catch(error => {
            d.reject({
                status: 500,
                message: `server's error`
            })
        })
    return d.promise;
}

const changePassword = (info) => {
    const d = q.defer();
    const {
        email,
        oldPassword,
        newPassword
    } = info;
    var role = '';

    dbController.find(collections.user, {
        email
    })
        .then(result => {
            if (result.length) {
                role = result[0].role;
                return comparePassword(oldPassword, result[0].password)
            }
            return false;
        })
        .then(match => {
            if (match) {
                cryptPassword(newPassword)
                    .then(passwordHash => {
                        dbController.update(collections.user, {
                            email: email
                        }, { password: passwordHash })
                            .then(value => {
                                console.log(value)
                                if (value) {
                                    d.resolve({
                                        status: 200,
                                        message: 'Update successfull'
                                    });
                                }
                                else {
                                    d.reject({
                                        status: 500,
                                        message: 'Error undefind!'
                                    })
                                }
                            }).catch(error => {
                                console.log(error);
                                d.reject({
                                    status: 500,
                                    message: 'Error undefind'
                                });
                            });
                    })
                    .catch(error => {
                        console.log(error)
                        d.reject({
                            status: 500,
                            message: "Can not hash password"
                        });
                    })
            } else {
                d.reject({
                    status: 401,
                    message: 'Password was wrong'
                });
            }
        })
        .catch(error => {
            d.reject({
                status: 403,
                message: 'Access denied!'
            });
        });
    return d.promise;
}

module.exports = {
    login,
    modifiedToken,
    register,
    loginFacebook,
    loginGoogle,
    getInfo,
    updateInfo,
    changePassword

}
