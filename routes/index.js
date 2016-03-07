var express = require("express");
var router = express.Router();
var controllers = require("../controllers");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });

module.exports = function(app) {

	//User authentication Api
	router.post("/login", controllers.users.login);
	router.post("/register", controllers.users.register);

	//auth middleware
	app.use(controllers.auth.isAuthenticated);

	//User Api
	router.get("/me", controllers.users.getCurrentUser);
	router.put("/me", controllers.users.updateCurrentUser);
	router.get("/users/:id", controllers.users.getUserById);
	router.get("/users", controllers.users.getUserByQuery);

	//Item Api
	router.get("/items", controllers.items.search);
	router.get("/items/:id", controllers.items.getById);
	router.put("/items/:id", controllers.items.update);
	router.delete("/items/:id", controllers.items.delete);
	router.post("/items", controllers.items.create);

	//Item Image Api
	router.post("/items/:id/images", upload.single('image'), controllers.images.upload);
	router.delete("/items/:id/images", controllers.images.delete);

	return router;
};