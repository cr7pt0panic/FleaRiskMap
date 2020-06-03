'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('WeatherHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Jan: {
        type: Sequelize.FLOAT
      },
      Feb: {
        type: Sequelize.FLOAT
      },
      Mar: {
        type: Sequelize.FLOAT
      },
      Apr: {
        type: Sequelize.FLOAT
      },
      May: {
        type: Sequelize.FLOAT
      },
      Jun: {
        type: Sequelize.FLOAT
      },
      Jul: {
        type: Sequelize.FLOAT
      },
      Aug: {
        type: Sequelize.FLOAT
      },
      Sep: {
        type: Sequelize.FLOAT
      },
      Oct: {
        type: Sequelize.FLOAT
      },
      Nov: {
        type: Sequelize.FLOAT
      },
      Dec: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      zipcodeId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'ZipCodes',
          key: 'id',
          as: 'zipcodeId'
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('WeatherHistories');
  }
};