'use strict';

let options = {
  tableName: 'Events'
};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(options, 'venueId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Venues'
      },
      onDelete: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(options, 'venueId');
  }
};
