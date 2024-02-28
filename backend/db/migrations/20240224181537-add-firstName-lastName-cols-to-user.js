'use strict';

let options = {
  tableName: 'Users'
};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(options, 'firstName', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn(options, 'lastName', {
      type: Sequelize.STRING,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(options, 'lastName');

    await queryInterface.removeColumn(options, 'firstName');
  }
};
