var Item = require("../models/index").items;
var User = require("../models/index").users;
var Image = require("../models/index").images;
var itemForbiddenOptions = ["userId", "createdAt", "imageId"];
var sendResult = require("../utils/commonMiddlewares").sendResult;
var async = require('async');


function searchItem(req, res, next) {}
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

    Item.findOne({
        where: where,
        include: include
    })
        .then(function(item) {
            if (!item) {
                res.status(404);
                req.result = {
                    error: 404,
                    description: 'Item not found',
                };
                return next();
            }

            req.result = item.dataValues;
            next();
        })
        .catch(function() {
            res.status(404);
            req.result = {
                error: 404,
                description: 'Item not found',
            };
            next();
        });
}

function updateItem(req, res, next) {
    var isAuthenticated = req.isAuthenticated;
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
    var i;

    if (!isAuthenticated) {
        res.status(401);
        req.result = {
            error: 401,
            description: 'No access token provided!'
        };
        return next();
    }

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
                res.status(404);
                req.result = {
                    error: 404,
                    description: 'Item not found',
                };
                return next();
            }

            item.update(updateQuery)
                .then(function(updatedItem) {
                    updatedItem.dataValues.user = item.user;
                    req.result = updatedItem.dataValues;
                    next();
                })
                .catch(function() {
                    res.status(422);
                    req.result = {
                        error: 422,
                        description: 'Failed to update item.',
                    };
                    next();
                });
        })
        .catch(function() {
            res.status(404);
            req.result = {
                error: 404,
                description: 'Item not found.'
            };
            next();
        });
}

function deleteItem(req, res, next) {
    var isAuthenticated = req.isAuthenticated;
    var id = req.params.id;
    var where = {
        id: id
    };
    var include = [{
        model: Image,
        required: false,
        as: "image"
    }];

    if (!isAuthenticated) {
        res.status(401);
        req.result = {
            error: 401,
            description: 'No access token provided!'
        };
        return next();
    }

    Item.findOne({
        where: where,
        include: include
    })
        .then(function(item) {
            if (!item) {
                res.status(404);
                req.result = {
                    error: 404,
                    description: 'Item not found.'
                };
                return next();
            }

            item.destroy()
                .then(function(deleted) {
                    req.result = deleted;
                    next();
                })
                .catch(function() {
                    res.status(422);
                    req.result = {
                        error: 422,
                        description: 'Item not deleted.'
                    };
                    next();
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
            res.status(400);
            req.result = {
                error: 400,
                description: 'Bad request'
            };
            next();
        });
}

function createItem(req, res, next) {
    var isAuthenticated = req.isAuthenticated;
    var currUser = req.currentUser;
    var createItem = req.body;

    if (!isAuthenticated) {
        res.status(401);
        req.result = {
            error: 401,
            description: 'No access token provided!'
        };
        return next();
    }

    createItem.userId = currUser.dataValues.id;
    createItem.imageId = null;

    Item.create(createItem)
        .then(function(createdItem) {
            createdItem.dataValues.user = currUser.toJSON();

            req.result = createdItem.dataValues;
            next();
        })
        .catch(function(err) {
            res.status(400);
            req.result = {
                error: 400,
                description: 'Failed to create new item.'
            };
            next();
        });
}

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