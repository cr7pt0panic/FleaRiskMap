'use strict';
module.exports = (sequelize, DataTypes) => {
  const ZipCodes = sequelize.define('ZipCodes', {
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: DataTypes.STRING,
    primary_city: DataTypes.STRING,
    state: DataTypes.STRING,
    county: DataTypes.STRING,
    timezone: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {});
  ZipCodes.associate = function(models) {
    // associations can be defined here
    ZipCodes.hasOne(models.WeatherHistory, {
      foreignKey: 'zipcodeId',
      as: 'weatherHistory'
    });
  };
  return ZipCodes;
};