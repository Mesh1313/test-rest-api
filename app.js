// Dependencies
var bodyParser = require('body-parser');
var express = require('express');
var requestHandler = require('./utils/requestHandler');

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(requestHandler);

// Routes
app.use('/api', require('./routes/index')(app));
app.use(express.static(__dirname + '/uploads'));

//Error handling
process.on('uncaughtException', function (err, req, res) {
	console.log(err.stack);
});

// Set port
app.listen(3000, function() {
	console.log('App running on port' + 3000);
});