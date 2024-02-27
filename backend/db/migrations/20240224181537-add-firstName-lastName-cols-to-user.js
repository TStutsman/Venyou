'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'firstName', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('Users', 'lastName', {
      type: Sequelize.STRING,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'lastName');

    await queryInterface.removeColumn('Users', 'firstName');
  }
};