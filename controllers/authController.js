var jwt = require("jsonwebtoken");
var jwtConfig = require("../utils/jwtConfig");
var User = require("../models/index").users;

function checkAuth(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var where = {};

    if (token) {
        jwt.verify(token, jwtConfig.secret, function(err, decoded) {
            if (err) {
                req.isAuthenticated = false;
                res.status(401);
                req.result = {
                    error: 401,
                    details: 'Invalid auth token.'
                };
                return next();
            }

            where.email = decoded.user;

            User.findOne({ where: where })
                .then(function(user) {
                    if (!user) {
                        res.status(401);
                        req.result = {
                            error: 401,
                            details: 'User not found.'
                        };
                        return next();
                    }

                    req.currentUser = user;
                    req.isAuthenticated = true;
                    return next();
                })
                .catch(function() {
                    req.isAuthenticated = false;
                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Bad request'
                    };
                    next();
                })
        });

        return;
    }
    req.isAuthenticated = false;
    next();
}

module.exports.isAuthenticated = checkAuth;