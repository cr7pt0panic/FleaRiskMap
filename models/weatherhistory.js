'use strict';
module.exports = (sequelize, DataTypes) => {
  const WeatherHistory = sequelize.define('WeatherHistory', {
    Jan: DataTypes.FLOAT,
    Feb: DataTypes.FLOAT,
    Mar: DataTypes.FLOAT,
    Apr: DataTypes.FLOAT,
    May: DataTypes.FLOAT,
    Jun: DataTypes.FLOAT,
    Jul: DataTypes.FLOAT,
    Aug: DataTypes.FLOAT,
    Sep: DataTypes.FLOAT,
    Oct: DataTypes.FLOAT,
    Nov: DataTypes.FLOAT,
    Dec: DataTypes.FLOAT,
    zipcodeId: DataTypes.INTEGER
  }, {});
  WeatherHistory.associate = function(models) {
    // associations can be defined here
    WeatherHistory.belongsTo(models.ZipCodes, {
      foreignKey: 'zipcodeId',
      onDelete: 'CASCADE'
    });
  };
  return WeatherHistory;
};