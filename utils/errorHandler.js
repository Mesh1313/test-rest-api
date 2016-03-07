var logger = require('./logger');

module.exports = function (err, req, res, next) {
    if (err) {
        err.status = err.status || 500;

        logger.log('error', 'request', {
            message: err.message,
            method: req.method,
            url: req.url,
            body: req.body
        });

        next(error);
    }

    next();
};