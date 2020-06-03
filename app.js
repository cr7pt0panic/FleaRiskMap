const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const app = express();
const path = require('path');
const weatherHistoryController = require('./controllers/WeatherHistoryController');

// View Engine Setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'static')));

// Global variable
global.__basedir = __dirname;

// Sync Database
const models = require("./models");
models.sequelize.sync().then(function() {
  console.log("Success! DB connection established!");
}).catch(function(err) {
  console.log(err, "Failure! Something went wrong with the Database!");
});

// Routes
require('./routes')(app);

// App Settings
const port = parseInt(process.env.PORT, 10) || 8080;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

module.exports = app;

// weatherHistoryController.updateWeatherHistoryAll();