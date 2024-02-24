'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Users';
    await queryInterface.addColumn(options, 'firstName', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn(options, 'lastName', {
      type: Sequelize.STRING,
    });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    await queryInterface.removeColumn(options, 'lastName');

    await queryInterface.removeColumn(options, 'firstName');
  }
};
