var User = require('../models/index').users;
var sendResult = require('../utils/commonMiddlewares').sendResult;
var userForbiddenOptions = ['password', 'salt', 'authToken', 'email'];

function login(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var where = { email: email };

    User.findOne({where: where})
        .then(function(user) {
            if (!user) {
                res.status(404);
                req.result = {
                    error: 404,
                    details: 'User not found',
                    fields: [{
                        field: 'password',
                        message: 'Wrong login and/or password, please check your login data'
                    }]
                };
                return next();
            }

            if (user.verifyPassword(password)) {
                req.result = user.dataValues;
                return next();
            }

            res.status(401);
            req.result = {
                error: 401,
                details: 'Failed to login',
                fields: [{
                    field: 'password',
                    message: 'Wrong login and/or password, please check your login data'
                }]
            };
            next();
        })
        .catch(function() {
            res.status(404);
            req.result = {
                error: 400,
                details: 'Bed request'
            };
            return next();
        });
}

function register(req, res, next) {
    var email = req.body.email;
    var where = {
        email: email
    };

    User.findOne({where: where})
        .then(function(user) {
            if (!user) {
                User.create(req.body)
                    .then(function(newUser) {
                        req.result = newUser.dataValues;
                        next();
                    })
                    .catch(function(err) {
                        res.status(400);
                        req.result = {
                            error: 400,
                            details: 'Bad registration data'
                        };
                        next();
                    });

                return;
            }

            res.status(400);
            req.result = {
                error: 400,
                details: 'Bad registration data',
                fields: [{
                    field: 'email',
                    message: 'Sorry, user with this email already exists. Please Log In.'
                }]
            };
            next();
        })
        .catch(function() {
            res.status(400);
            req.result = {
                error: 400,
                details: 'Bad registration data',
                fields: [{
                    'field': 'email',
                    'message': 'Your email is not valid'
                }]
            };
            next();
        });
}

function getCurrentUser(req, res, next) {
    var currentUser = req.currentUser;
    var isAuthenticated = req.isAuthenticated;

    if (!isAuthenticated) {
        res.status(401);
        req.result = {
            error: 401,
            description: 'No access token provided!'
        };
        return next();
    }
    req.result = currentUser.dataValues;
    next();
}

function updateCurrentUser(req, res, next) {
    var isAuthenticated = req.isAuthenticated;
    var currentUser = req.currentUser;
    var newUserData = req.body;
    var userUpdateProperties = Object.keys(newUserData);
    var i;

    if (!isAuthenticated) {
        res.status(401);
        req.result = {
            error: 401,
            description: 'No access token provided!'
        };
        return next();
    }

    for (i = 0; i < userUpdateProperties.length; i++) {
        if (userForbiddenOptions.indexOf(userUpdateProperties[i]) >= 0) {
            delete newUserData[userUpdateProperties[i]];
        }
    }

    currentUser.update(newUserData)
        .then(function(updatedUser) {
            req.result = updatedUser.dataValues;
            next();
        })
        .catch(function() {
            res.status(400);
            req.result = {
                error: 400,
                description: 'Bad user data'
            };
            next();
        });
}

function getUserById(req, res, next) {
    var searchQuery = {
        id: req.params.id
    };

    User.findOne({where: searchQuery})
        .then(function(searchUser) {
            if (!searchUser) {
                res.status(404);
                req.result = {
                    error: 404,
                    description: 'User not found',
                    fields: [{
                        'field': 'email',
                        'message': 'No such user founded. Please register.'
                    }]
                };
                return next();
            }

            req.result = searchUser.toJSON();
            next();
        })
        .catch(function() {
            res.status(404);
            req.result = {
                error: 404,
                description: 'User not found',
            };
            next();
        });
}

function getUserByQuery(req, res, next) {
    var queryObj = req.query;
    var where = {$or: {}};

    where.$or = {
        email: {$like: "%" + queryObj.email + "%"},
        name: {$like: "%" + queryObj.name + "%"}
    };

    User.findAll({where: where})
        .then(function(users) {
            req.result = users;
            next();
        })
        .catch(function() {
            res.status(400);
            req.result = {
                error: 400,
                description: 'Bad request',
            };
            next();
        });
}

var loginMethods = [
    login,
    sendResult
];
var registerMethods = [
    register,
    sendResult
];
var getCurrentUserMethods = [
    getCurrentUser,
    sendResult
];
var updateCurrentUserMethods = [
    updateCurrentUser,
    sendResult
];
var getUserByIdMethods = [
    getUserById,
    sendResult
];
var getUserByQueryMethods = [
    getUserByQuery,
    sendResult
];

module.exports = {
    login: loginMethods,
    register: registerMethods,
    getCurrentUser: getCurrentUserMethods,
    updateCurrentUser: updateCurrentUserMethods,
    getUserById: getUserByIdMethods,
    getUserByQuery: getUserByQueryMethods
}