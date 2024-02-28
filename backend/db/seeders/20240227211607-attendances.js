'use strict';

const { Attendance, Event, User } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const attendances = [
  {
    status: "waitlist"
  },
  {
    status: "attending"
  },
  {
    status: "pending"
  }
];

let toDelete;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const eventIds = await Event.findAll({
      attributes: ['id']
    });
    const userIds = await User.findAll({
      attributes: ['id']
    });

    toDelete = userIds.map(user => user.id);

    attendances.forEach((attendee, i) => {
      attendee.eventId = eventIds[i % eventIds.length].id;
      attendee.userId = userIds[i % userIds.length].id;
    });

    await Attendance.bulkCreate(attendances, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    const { Op } =  Sequelize;
    await queryInterface.bulkDelete(options, {
      userId: { [Op.in]: toDelete }
    }, {});
  }
};
