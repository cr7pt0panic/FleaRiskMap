const models = require('../models');
const axios = require('axios');
const Op = require('sequelize').Op;

function padWithZero(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getWeatherHistory(zipcode) {
  const zipCode = padWithZero(zipcode, 5);
  const licenseKey = 'l-iATfVmrrpFREr6R8RYiM**nSAcwXpxhQ0PC2lXxuDAZ-**';
  const weatherApiUrl = `https://www.melissa.com/v2/lookups/zipclimate/zipcode/?zipcode=${zipCode}&fmt=json&id=${licenseKey}`;
  console.log(zipCode);
  return axios
          .get(weatherApiUrl)
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            return err;
          });
}

// Function for updating database
exports.updateWeatherHistoryAll = async function() {
  const weatherHistories = await models.WeatherHistory.findAll({
    where: {
      [Op.or]: [
        { Jan: { [Op.eq]: null } },
        { Feb: { [Op.eq]: null } },
        { Mar: { [Op.eq]: null } },
        { Apr: { [Op.eq]: null } },
        { May: { [Op.eq]: null } },
        { Jun: { [Op.eq]: null } },
        { Jul: { [Op.eq]: null } },
        { Aug: { [Op.eq]: null } },
        { Sep: { [Op.eq]: null } },
        { Oct: { [Op.eq]: null } },
        { Nov: { [Op.eq]: null } },
        { Dec: { [Op.eq]: null } }
      ]
    },
    include: [{
      model: models.ZipCodes,
      attributes: [
        'code',
        'type'
      ],
      where: {
        [Op.or]: [
          { 'type': { [Op.eq]: 'STANDARD' } },
          { 'type': { [Op.eq]: 'UNIQUE' } }
        ]        
      }
    }],
  });

  for(const [index, weatherHistory] of weatherHistories.entries()) {
    const response = await getWeatherHistory(weatherHistory.ZipCode.code);
    if(Object.prototype.toString.call(response) == '[object Array]' && response.length > 10) {
      await weatherHistory.update({
        Jan: response[0]['AvgTemp'],
        Feb: response[1]['AvgTemp'],
        Mar: response[2]['AvgTemp'],
        Apr: response[3]['AvgTemp'],
        May: response[4]['AvgTemp'],
        Jun: response[5]['AvgTemp'],
        Jul: response[6]['AvgTemp'],
        Aug: response[7]['AvgTemp'],
        Sep: response[8]['AvgTemp'],
        Oct: response[9]['AvgTemp'],
        Nov: response[10]['AvgTemp'],
        Dec: response[11]['AvgTemp'],
      });
    }
  };
};

// API for getting weather history data by state
exports.getWeatherHistoryByStates = (req, res) => {
  const monthIndex = req.body.month ? req.body.month : 0;
  const monthFields = [
    'Jan', 
    'Feb', 
    'Mar', 
    'Apr', 
    'May', 
    'Jun', 
    'Jul', 
    'Aug', 
    'Sep', 
    'Oct', 
    'Nov', 
    'Dec'
  ];
  const monthField = monthFields[monthIndex];

  models.WeatherHistory.findAll({
    attributes: [
      [models.sequelize.fn('AVG', models.sequelize.col('WeatherHistory.' + monthField)), 'AvgTemp']
    ],
    include: [{
      model: models.ZipCodes,
      attributes: [
        'state'
      ],
      where: {
        [Op.or]: [
          { 'type': { [Op.eq]: 'STANDARD' } },
          { 'type': { [Op.eq]: 'UNIQUE' } }
        ]        
      }
    }],
    group: [
      'ZipCode.state'
    ],
    raw: true
  }).then(statesWeatherHistory => {
    const resData = statesWeatherHistory.map(obj => {
      let val = 1;
      if(obj['AvgTemp'] <= 50) {
        val = 1;
      } else if(obj['AvgTemp'] <= 80) {
        val = Math.trunc((obj['AvgTemp'] - 51) / 5) + 2;
      } else if(obj['AvgTemp'] <= 90) {
        val = 8;
      } else if(obj['AvgTemp'] <= 95) {
        val = 9;
      } else {
        val = 10;
      }
      val = Math.max(0, val);

      return {
        "code": obj['ZipCode.state'],
        "value": val
      }
    })
    res.json(resData)
  });
};

// API for getting weather history data by zip code
exports.getWeatherHistoryByZipcode = (req, res) => {
  const monthIndex = req.body.month ? req.body.month : 0;
  const monthFields = [
    'Jan', 
    'Feb', 
    'Mar', 
    'Apr', 
    'May', 
    'Jun', 
    'Jul', 
    'Aug', 
    'Sep', 
    'Oct', 
    'Nov', 
    'Dec'
  ];
  const monthField = monthFields[monthIndex];
  const zipcode = req.body.zipcode ? req.body.zipcode : 0; 
  const email = req.body.email ? req.body.email : 0; 

  console.log(monthField, zipcode, email);

  models.WeatherHistory.findOne({
    where: [
      { Jan: { [Op.ne]: null } },
      { Feb: { [Op.ne]: null } },
      { Mar: { [Op.ne]: null } },
      { Apr: { [Op.ne]: null } },
      { May: { [Op.ne]: null } },
      { Jun: { [Op.ne]: null } },
      { Jul: { [Op.ne]: null } },
      { Aug: { [Op.ne]: null } },
      { Sep: { [Op.ne]: null } },
      { Oct: { [Op.ne]: null } },
      { Nov: { [Op.ne]: null } },
      { Dec: { [Op.ne]: null } }
    ],
    include: [{
      model: models.ZipCodes,
      attributes: [
        'code',
        'type',
        'state',
        'county',
        'latitude',
        'longitude'
      ],
      where: {
        code: { [Op.eq]: zipcode },
        [Op.or]: [
          { 'type': { [Op.eq]: 'STANDARD' } },
          { 'type': { [Op.eq]: 'UNIQUE' } }
        ]        
      }
    }]
  }).then(weatherHistory => {
    let val = 1;
    if(weatherHistory[monthField] <= 50) {
      val = 1;
    } else if(weatherHistory[monthField] <= 80) {
      val = Math.trunc((weatherHistory[monthField] - 51) / 5) + 2;
    } else if(weatherHistory[monthField] <= 90) {
      val = 8;
    } else if(weatherHistory[monthField] <= 95) {
      val = 9;
    } else {
      val = 10;
    }
    val = Math.max(0, val);

    const resData = {
      'state': weatherHistory.ZipCode.state,
      'lat': weatherHistory.ZipCode.latitude,
      'lon': weatherHistory.ZipCode.longitude,
      'name': weatherHistory.ZipCode.county,
      'value': val
    }
    res.json(resData)
  });
};

// API for validating zip code
exports.validateZipCode = (req, res) => {
  const zipcode = req.body.zipcode ? req.body.zipcode : 0;

  models.WeatherHistory.findOne({
    where: [
      { Jan: { [Op.ne]: null } },
      { Feb: { [Op.ne]: null } },
      { Mar: { [Op.ne]: null } },
      { Apr: { [Op.ne]: null } },
      { May: { [Op.ne]: null } },
      { Jun: { [Op.ne]: null } },
      { Jul: { [Op.ne]: null } },
      { Aug: { [Op.ne]: null } },
      { Sep: { [Op.ne]: null } },
      { Oct: { [Op.ne]: null } },
      { Nov: { [Op.ne]: null } },
      { Dec: { [Op.ne]: null } }
    ],
    include: [{
      model: models.ZipCodes,
      attributes: [
        'code',
        'type',
        'state'
      ],
      where: {
        code: { [Op.eq]: zipcode },
        [Op.or]: [
          { 'type': { [Op.eq]: 'STANDARD' } },
          { 'type': { [Op.eq]: 'UNIQUE' } }
        ]        
      }
    }],
  }).then(weatherHistory => {
    if(weatherHistory) {
      res.json({
        'valid': true,
        'state': weatherHistory.ZipCode.state
      });
    } else {
      res.json({
        'valid': false
      });
    }
  });
};