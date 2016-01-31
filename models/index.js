var Users = require("./users");
var Items = require("./items");
var Images = require("./images");

Items.belongsTo(Users, {foreignKey: 'userId'});
Users.hasMany(Items, {foreignKey: 'userId'});

Items.belongsTo(Images, {foreignKey: 'imageId'});
Images.hasMany(Items, {foreignKey: 'imageId'});

module.exports = {
    users: Users,
    items: Items,
    images: Images
};
