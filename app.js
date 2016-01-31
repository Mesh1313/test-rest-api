// Dependencies
var bodyParser = require("body-parser");
var express = require("express");

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json());

// Routes
app.use("/api", require("./routes/index")(app));

app.use(express.static(__dirname + '/uploads'));

// Set port
app.listen(3000, function() {
	console.log("App is running...");
});