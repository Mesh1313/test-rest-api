var User = require("../models/index").users;
var sendResult = require("../utils/commonMiddlewares").sendResult;
var userForbiddenOptions = ["password", "salt", "authToken", "email"];

function login(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var where = { email: email };
    var error = new Error();

    User.findOne({where: where})
        .then(function(user) {
            if (!user) {
                error.status = 404;
                error.fields = [{
                    field: "password",
                    message: "Wrong login and/or password, please check your login data"
                }];
                error.message = "User not found";
                return next(error);
            }

            if (user.verifyPassword(password)) {
                req.result = user.dataValues;
                next();
            } else {
                error.status = 401;
                error.fields = [{
                    "field": 'password',
                    "message": "Wrong login and/or password, please check your login data"
                }];
                error.message = "Failed to login";
                return next(error);
            }
        })
        .catch(function() {
            res.status(400);
            next(error);
        });
}

function register(req, res, next) {
    var email = req.body.email;
    var where = {
        email: email
    };
    var error = new Error();

    User.findOne({where: where})
        .then(function(user) {
            if (!user) {
                User.create(req.body)
                    .then(function(newUser) {
                        req.result = newUser.dataValues;
                        next();
                    })
                    .catch(function(err) {
                        error.message = "Bad registration data";
                        error.status = 400;
                        error.fields = [];

                        for (var i in error.errors) {
                            error.fields.push({
                                "message": error.errors[i].message,
                                "field": error.errors[i].path
                            });
                        }

                        res.status(400);
                        next(error);
                    })
            } else {
                res.status(401);
                error.status = 401;
                error.message = "Failed to register";
                error.fields = [{
                    "field": 'email',
                    "message": 'Sorry, user with this email already created. Please Log In.'
                }];
                next(error);

            }
        })
        .catch(function() {
            res.status(400);
            error.status = 400;
            error.fields = [{
                "field": 'email',
                "message": 'Your email is not valid'
            }];
            next(error);
        });
}

function getCurrentUser(req, res, next) {
    var currentUser = req.currentUser;

    req.result = currentUser.dataValues;
    next();
}

function updateCurrentUser(req, res, next) {
    var currentUser = req.currentUser;
    var newUserData = req.body;
    var userUpdateProperties = Object.keys(newUserData);
    var i;
    var error = new Error();

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
            error.status = 400;
            error.message = "Bad user data";
            error.fields = [];
            for (var i in error.errors) {
                error.fields.push({
                    "message": error.errors[i].message,
                    "field": error.errors[i].path
                });
            }
            res.status(400);
            next(error);
        });
}

function getUserById(req, res, next) {
    var searchQuery = {
        id: req.params.id
    };
    var error = new Error();

    User.findOne({where: searchQuery})
        .then(function(searchUser) {
            if (!searchUser) {
                res.status(404);
                error.status = 404;
                error.message = "User not found";
                error.fields = [{
                    "field": 'email',
                    "message": 'No such user. Please register.'
                }];
                next(error);
                return;
            }

            req.result = searchUser.toJSON();
            next();
        })
        .catch(function() {
            error.status = 404;
            error.message = "Id is not found";
            return next(error);
        });
}

function getUserByQuery(req, res, next) {
    var queryObj = req.query;
    var where = {$or: {}};
    var error = new Error();

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
            error.status = 400;
            next(error);
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