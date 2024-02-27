'use strict';

const { Attendance } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const attendances = [
  {
    eventId: 1,
    userId: 5,
    status: "waitlist"
  },
  {
    eventId: 2,
    userId: 7,
    status: "attending"
  },
  {
    eventId: 3,
    userId: 7,
    status: "pending"
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    Attendance.bulkCreate(attendances, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    const { Op } =  Sequelize;
    await queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [5, 7] }
    }, {});
  }
};
