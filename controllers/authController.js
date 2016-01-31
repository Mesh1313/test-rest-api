var jwt = require("jsonwebtoken");
var jwtConfig = require("../utils/jwtConfig");
var User = require("../models/index").users;

function checkAuth(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var where = {};
    var error = new Error();

    if (token) {
        jwt.verify(token, jwtConfig.secret, function(err, decoded) {
            if (err) {
                error.status = 401;
                error.message = "Invalid auth token.";
                return next(error);
            }

            where.email = decoded.user;

            User.findOne({ where: where })
                .then(function(user) {
                    if (!user) {
                        error.status = 401;
                        error.message = "User not found.";
                        next(error);
                    }

                    req.currentUser = user;
                    return next();
                })
                .catch(function() {
                    error.status = 400;
                    error.message = "Bad request";
                    next(error);
                })
        });
    } else {
        error.status = 403;
        error.message = "No token provided";
        next(error);
    }
}

module.exports.isAuthenticated = checkAuth;