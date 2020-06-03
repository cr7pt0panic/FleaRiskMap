module.exports = function(app) {
  const express = require("express")
  const router = express.Router();

  const weatherHistoryController = require('../controllers/WeatherHistoryController');

  const path = __basedir + '/views/';

  router.use((req, res, next) => {
    next();
  });

  app.get("/", (req, res) => {
    res.sendFile(path + "index.html");
  });

  app.post("/api/weatherhistory/states", weatherHistoryController.getWeatherHistoryByStates);
  app.post("/api/weatherhistory/zipcode", weatherHistoryController.getWeatherHistoryByZipcode);
  app.post("/api/zipcodes/validate", weatherHistoryController.validateZipCode);

  app.use("/", router);

  app.use('*', (req, res) => {
    res.sendFile(path + "404.html")
  });
};