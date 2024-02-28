'use strict';

const options = {
  tableName: 'Events'
};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(options, 'venueId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(options, 'venueId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
