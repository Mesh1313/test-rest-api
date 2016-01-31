var express = require("express");
var router = express.Router();
var controllers = require("../controllers");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });

module.exports = function(app) {
	//User authentication Api
	router.post("/login", controllers.users.login);
	router.post("/register", controllers.users.register);

	//User Api
	router.get("/me", controllers.auth.isAuthenticated, controllers.users.getCurrentUser);
	router.put("/me", controllers.auth.isAuthenticated, controllers.users.updateCurrentUser);
	router.get("/user/:id", controllers.auth.isAuthenticated, controllers.users.getUserById);
	router.get("/user", controllers.users.getUserByQuery);

	//Item Api
	router.get("/item", controllers.items.search);
	router.get("/item/:id", controllers.items.getById);
	router.put("/item/:id", controllers.auth.isAuthenticated, controllers.items.update);
	router.delete("/item/:id", controllers.auth.isAuthenticated, controllers.items.delete);
	router.post("/item", controllers.auth.isAuthenticated, controllers.items.create);

	//Item Image Api
	router.post("/item/:id/image", controllers.auth.isAuthenticated, upload.single('image'), controllers.images.upload);
	router.delete("/item/:id/image", controllers.auth.isAuthenticated, controllers.images.delete);

	return router;
};