'use strict';

const { Attendance, Event, User } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const userEventAttendances = [
  {
    username: 'FakeUser1',
    name: 'Tennis Group First Meet and Greet',
    status: "waitlist"
  },
  {
    username: 'FakeUser1',
    name: 'Wake Boarding First Wave',
    status: "attending"
  },
  {
    username: 'FakeUser2',
    name: 'Weekly Watercolor',
    status: "pending"
  }
];

let toDelete;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    for(let userEventAttendance of userEventAttendances) {
      const { username, name, status } = userEventAttendance;
      const user = await User.findOne({ where: { username } });
      const event = await Event.findOne({ where: { name } });

      await Attendance.create({ status, userId: user.id, eventId: event.id }, { validate: true });
    }

    // await Attendance.bulkCreate(attendances, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    
    for(let userEventAttendance of userEventAttendances) {
      const { username, name, status } = userEventAttendance;
      const user = await User.findOne({ where: { username } });
      const event = await Event.findOne({ where: { name } });

      await Attendance.destroy({ where: { status, userId: user.id, eventId: event.id } });
    }
  }
};
