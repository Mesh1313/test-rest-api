var Item = require("../models/index").items;
var User = require("../models/index").users;
var Image = require("../models/index").images;
var itemForbiddenOptions = ["userId", "createdAt", "imageId"];
var sendResult = require("../utils/commonMiddlewares").sendResult;

function searchItem(req, res, next) {};
function getItemById(req, res, next) {
    var id = req.params.id;
    var where = {
        id: id
    };
    var include = [{
        model: User,
        required: true,
        as: "user"
    }, {
        model: Image,
        required: false,
        as: "image"
    }];
    var error = new Error();

    Item.findOne({
        where: where,
        include: include
    })
        .then(function(item) {
            if (!item) {
                error.status = 404;
                error.message = "Item not found";
                return next(error);
            }

            req.result = item.dataValues;
            next();
        })
        .catch(function() {
            error.status = 404;
            error.message = "Item not found";
            next(error);
        });
};
function updateItem(req, res, next) {
    var updateQuery = req.body;
    var whereItem = {
        id: req.params.id
    };
    var include = [{
        model: User,
        required: true,
        as: "user"
    }];
    var itemUpdateProperties = Object.keys(updateQuery);
    var error = new Error();
    var i;

    for (i = 0; i < itemUpdateProperties.length; i++) {
        if (itemForbiddenOptions.indexOf(itemUpdateProperties[i]) >= 0) {
            delete updateQuery[itemUpdateProperties[i]];
        }
    }

    Item.findOne({
        where: whereItem,
        include: include
    })
        .then(function(item) {
            if (!item) {
                error.status = 404;
                error.message = "Item not found."
                return next(error);
            }

            item.update(updateQuery)
                .then(function(updatedItem) {
                    updatedItem.dataValues.user = item.user;
                    req.result = updatedItem.dataValues;
                    next();
                })
                .catch(function() {
                    error.status = 422;
                    error.message = "Failed to update item."
                    next(error);
                });
        })
        .catch(function() {
            error.status = 404;
            error.message = "Item not found."
            next(error);
        });
};
function deleteItem(req, res, next) {
    var id = req.params.id;
    var where = {
        id: id
    };
    var include = [{
        model: Image,
        required: false,
        as: "image"
    }];
    var error = new Error();


    Item.findOne({
        where: where,
        include: include
    })
        .then(function(item) {
            if (!item) {
                error.status = 404;
                error.message = "Item not found.";
                return next(error);
            }

            item.destroy()
                .then(function(deleted) {
                    req.result = deleted;
                    next();
                })
                .catch(function() {
                    error.status = 422;
                    error.message = "Item not deleted.";
                    next(error);
                });

            if (item.image) {
                Image.findOne({ where: { id: item.image.imageId } })
                    .then(function(image) {
                        if (image) {
                            image.destroy();
                        }
                    });
            }
        })
        .catch(function() {
            error.status = 400;
            error.message = "Bad request";
            next(error);
        });
};
function createItem(req, res, next) {
    var currUser = req.currentUser;
    var createItem = req.body;
    var error = new Error();


    createItem.userId = currUser.dataValues.id;
    createItem.imageId = null;

    Item.create(createItem)
        .then(function(createdItem) {
            createdItem.dataValues.user = currUser.toJSON();

            req.result = createdItem.dataValues;
            next();
        })
        .catch(function(err) {
            error.status = 400;
            error.message = "Failed create new item.";
            next(error);
        });
};

var searchItemMethods = [
    searchItem,
    sendResult
];
var getItemByIdMethods = [
    getItemById,
    sendResult
];
var updateItemMethods = [
    updateItem,
    sendResult
];
var deleteItemMethods = [
    deleteItem,
    sendResult
];
var createItemMethods = [
    createItem,
    sendResult
];

module.exports = {
    search: searchItemMethods,
    getById: getItemByIdMethods,
    update: updateItemMethods,
    delete: deleteItemMethods,
    create: createItemMethods
};