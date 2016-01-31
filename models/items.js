var SequelizeBase = require('sequelize');
var sequelize = require('./../utils/sequelize');

var Items = sequelize.define("items", {
    title: {
        type: SequelizeBase.STRING,
        allowNull: false
    },
    createdAt: {
        type: SequelizeBase.INTEGER
    },
    price: {
        type: SequelizeBase.DECIMAL,
        allowNull: true
    },
    imageId: {
        type: SequelizeBase.INTEGER,
        references: {
            model: "images",
            key: "id"
        },
        allowNull: true
    },
    userId: {
        type: SequelizeBase.INTEGER,
        references: {
            model: "users",
            key: "id"
        },
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false,
    hooks: {
        beforeCreate: function(item) {
            item.createdAt = Math.floor(Date.now() / 1000);
        }
    }
});


module.exports = Items;