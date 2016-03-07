var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({json: true, timestamp: true, colorize: true})
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({json: true, timestamp: true })
    ],
    exitOnError: true
});

module.exports = logger;