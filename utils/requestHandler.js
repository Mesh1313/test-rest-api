var logger = require('./logger');

module.exports = function (req, res, next) {
    logger.log('info', 'request', {
        headers: req.headers,
        method: req.method,
        url: req.url,
        body: req.body
    });

    next();
};