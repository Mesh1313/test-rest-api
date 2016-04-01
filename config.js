var config = {
    db: {
        host: "localhost",
        port: 3306,
        dbname: "cltestdb",
        user: "root",
        password: "111",
        charset: 'utf8mb4',
        connectionRetryCount: 5,
        delayBeforeReconnect: 3000,
        showErrors: true
    }
};

module.exports = config;
