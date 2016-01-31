var Image = require("../models/index").images;
var Item = require("../models/index").items;
var sendResult = require("../utils/commonMiddlewares").sendResult;
var path = require("path");
var fs = require("fs");
var imagesDir = path.dirname(require.main.filename);

function uploadImage (req, res, next) {
    var itemId = req.params.id;
    var where = {
        id: itemId
    };
    var newImgData = {};
    var error = new Error();

    Item.findOne({ where: where })
        .then(function(item) {
            if (!item) {
                error.status = 404;
                error.message = "Item not found.";
                return next(error);
            }

            newImgData.title = "Item (id" + item.id + ") image";
            newImgData.description = "Item (id" + item.id + ") image";
            newImgData.url = req.file.path;

            Image.create(newImgData)
                .then(function(image) {
                    if (!image) {
                        error.status = 400;
                        error.message = "Failed to create image.";
                        return next(error);
                    }

                    item.update({ imageId: image.id });

                    item.dataValues.image = image.dataValues;
                    req.result = item.dataValues;
                    next();
                })
                .catch(function(err) {
                    error.status = 400;
                    error.message = "Failed to create image.";
                    next(error);
                });
        })
        .catch(function() {
            error.status = 400;
            error.message = "Bad request.";
            next(error);
        });
};
function deleteImage (req, res, next) {
    var itemId = req.params.id;
    var where = {
        id: itemId
    };
    var include = [{
        model: Image,
        required: false,
        as: "image"
    }];
    var deleteImgWhere = {};
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

            item.update({ imageId: null });
            deleteImgWhere.id = item.image.id;

            Image.findOne({ where: deleteImgWhere })
                .then(function(image) {
                    if (image) {
                        image.destroy()
                            .then(function(img) {
                                if (img) {
                                    console.log(imagesDir + "/" + img.url);
                                    fs.unlinkSync(imagesDir + "/" + img.url);

                                    item.dataValues.image = null;
                                    req.result = item.dataValues;
                                    return next();
                                }

                                error.status = 400;
                                error.message = "Failed to delete image.";
                                next(error);
                            })
                            .catch(function(err) {
                                error.status = 400;
                                error.message = "Failed to delete image.";
                                next(error);
                            });
                    }
                })
                .catch();
        })
        .catch(function() {
            error.status = 400;
            error.message = "Bad request.";
            next(error);
        });
};

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