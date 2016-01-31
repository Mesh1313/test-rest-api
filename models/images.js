var SequelizeBase = require('sequelize');
var sequelize = require('./../utils/sequelize');

var Images = sequelize.define("images", {
    url: {
        type: SequelizeBase.STRING,
        allowNull: false
    },
    description: {
        type: SequelizeBase.INTEGER,
        allowNull: true
    },
    title: {
        type: SequelizeBase.DECIMAL,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false
});


module.exports = Images;