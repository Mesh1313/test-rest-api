var crypto = require("crypto");
var SequelizeBaze = require("sequelize");
var sequelize = require("./../utils/sequelize");
var jwtConfig = require("./../utils/jwtConfig");
var algorithm = "aes-256-ctr";

var encrypt = function (str) {
    var cipher = crypto.createCipher(algorithm, str);
    var crypted = cipher.update(str, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
};
var encryptPass = function (password, salt) {
    var tmpPass = encrypt(password);
    return encrypt(tmpPass + salt);
};
var verifyPassword = function (incomingPassword) {
    return this.password == encryptPass(incomingPassword, this.salt);
};
var generateSalt = function () {
    return crypto.randomBytes(16).toString("base64");
};
var toJson = function () {
    var values = this.get();

    delete values.password;
    delete values.salt;
    delete values.authToken;
    return values;
};
var currentToJSON = function () {
    var values = this.get();

    delete values.password;
    delete values.salt;
    return values;
};
var getToken = function(user) {
    return jwtConfig.sign({user: user.email}, "1 day");
};

var hooks = {
    beforeCreate: function (user, options) {
        user.salt = generateSalt();
        user.password = encryptPass(user.password, user.salt);
        user.authToken = getToken(user);
    }
};

var instanceMethods = {
    verifyPassword: verifyPassword,
    toJSON: toJson,
    currentToJSON: currentToJSON
};

var attributes = {
    name: {
        type: SequelizeBaze.STRING,
        field: "name",
        allowNull: false
    },
    phone: {
        type: SequelizeBaze.STRING,
        field: "phone"
    },
    email: {
        type: SequelizeBaze.STRING,
        field: "email",
        unique: true,
        validate: {
            isEmail: true
        },
        allowNull: false
    },
    password: {
        type: SequelizeBaze.STRING,
        field: "password",
        allowNull: false
    },
    salt: {
        type: SequelizeBaze.STRING,
        field: "salt"
    },
    authToken: {
        type: SequelizeBaze.STRING,
        field: "authToken"
    }
};

var params = {
    freezeTableName: true,
    timestamps: false,
    hooks: hooks,
    instanceMethods: instanceMethods
};

var Users = sequelize.define("users", attributes, params);

module.exports = Users;