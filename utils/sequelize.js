var config = require("../config");
var Sequelize = require("sequelize");
var sqlzInstance = new Sequelize(config.db.dbname, config.db.user, config.db.password, {
    host: "localhost",
    dialect: "mysql",
    define: {
        timestamp: false
    },
    pool: {
        max: 100,
        min: 5,
        idle: 10000
    }
});

module.exports = sqlzInstance;