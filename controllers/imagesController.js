var Image = require('../models/index').images;
var Item = require('../models/index').items;
var sendResult = require('../utils/commonMiddlewares').sendResult;
var path = require('path');
var fs = require('fs');
var imagesDir = path.dirname(require.main.filename);
var async = require('async');

function uploadImage (req, res, next) {
    var isAuthenticated = req.isAuthenticated;
    var where = {
        id: req.params.id
    };

    if (!isAuthenticated) {
        res.status(401);
        req.result = {
            error: 401,
            details: 'No access token provided!'
        };
        return next();
    }

    async.waterfall([
        function findItem(callback) {
            Item.findOne({ where: where })
                .then(function(item) {
                    var imgData = {};

                    if (!item) {
                        res.status(404);
                        req.result = {
                            error: 404,
                            details: 'Item not found.'
                        };
                        next();
                        return callback({}, null);
                    }

                    imgData.title = 'Item (id' + item.id + ') image';
                    imgData.description = 'Item (id' + item.id + ') image';
                    imgData.url = req.file.path;

                    callback(null, imgData, item);
                })
                .catch(function() {
                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Bad request.'
                    };
                    next();
                    callback({}, null);
                });
        },
        function createImage(imgData, item, callback) {
            Image.create(imgData)
                .then(function(image) {
                    if (!image) {
                        res.status(400);
                        req.result = {
                            error: 400,
                            details: 'Failed to create image.'
                        };
                        next();
                        return callback({}, null);
                    }

                    callback(null, item, image);
                })
                .catch(function() {
                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to create image.'
                    };
                    next();
                    callback({}, null);
                });
        },
        function updateItem(item, image, callback) {
            item.update({ imageId: image.id })
                .then(function(item) {
                    if(item) {
                        return callback(null, item, image);
                    }

                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to update item.'
                    };
                    next();
                    callback({}, null);
                })
                .catch(function() {
                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to update item.'
                    };
                    next();
                    callback({}, null);
                });
        }
    ], function(err, item, image) {
        if (err) {
            return;
        }

        item.dataValues.image = image.dataValues;
        req.result = item.dataValues;
        next();
    });
}

function deleteImage (req, res, next) {
    var isAuthenticated = req.isAuthenticated;
    var where = {
        id: req.params.id
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
            details: 'No access token provided!'
        };
        return next();
    }

    async.auto({
        findItem: function(callback) {
            Item.findOne({
                where: where,
                include: include
            }).then(function(item) {
                if (!item) {
                    res.status(404);
                    req.result = {
                        error: 404,
                        details: 'Item not found.'
                    };
                    next();
                    return callback({}, null);
                }

                callback(null, item);
            }).catch(function() {
                res.status(400);
                req.result = {
                    error: 400,
                    details: 'Bad request.'
                };
                next();
                callback({}, null);
            });
        },
        updateItem: ['findItem', function(callback, result) {
            var item = result.findItem;

            item.update({ imageId: null })
                .then(function(item) {
                    if (item) {
                        return callback(null, item);
                    }

                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to update item.'
                    };
                    next();
                    callback({}, null);
                })
                .catch(function(err) {
                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to update item.'
                    };
                    next();
                    callback({}, null);
                });
        }],
        findImage: ['findItem', function(callback, result) {
            var item = result.findItem;
            var imageId = item.dataValues.image.id;
            var where = {
                id: imageId
            };

            Image.findOne({ where: where })
                .then(function(image) {
                    if (image) {
                        return callback(null, image);
                    }

                    res.status(404);
                    req.result = {
                        error: 404,
                        details: 'Image not found.'
                    };
                    next();
                    callback({}, null);
                })
                .catch(function() {
                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to delete image.'
                    };
                    next();
                    callback({}, null);
                });
        }],
        deleteImage: ['findImage', function(callback, result) {
            var item = result.findItem;
            var image = result.findImage;

            image.destroy()
                .then(function(img) {
                    if (img) {
                        fs.unlinkSync(imagesDir + "/" + img.url);

                        item.dataValues.image = null;
                        item.dataValues.imageId = null;
                        return callback(null, item);
                    }

                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to delete image.'
                    };
                    next();
                    return callback({}, null);
                })
                .catch(function() {
                    res.status(400);
                    req.result = {
                        error: 400,
                        details: 'Failed to delete image.'
                    };
                    next();
                    callback({}, null);
                });
        }]
    }, function(err, res) {
        var item;
        if (err) {
            return;
        }

        item = res.deleteImage.dataValues;
        req.result = item;
        next();
    });
}

var uploadImageMethods = [
    uploadImage,
    sendResult
];
var deleteImageMethods = [
    deleteImage,
    sendResult
];

module.exports = {
    upload: uploadImageMethods,
    delete: deleteImageMethods
}