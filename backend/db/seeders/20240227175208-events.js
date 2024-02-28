'use strict';

const { literal } = require('sequelize');
const { Event, Group, Venue } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const events = [
  {
    venueId: null,
    name: "Tennis Group First Meet and Greet",
    description: "First meet and greet event for the evening tennis on the water group! Join us online for happy times!",
    type: "Online",
    startDate: "2024-02-27 17:44:32.455 +00:00",
    endDate: literal('CURRENT_TIMESTAMP'),
    capacity: 10,
    price: 0
  },
  {
    name: "Wake Boarding First Wave",
    description: "First time this season out on the water! Beginners welcome",
    type: "In Person",
    startDate: "2021-11-19 20:00:00.000 +00:00",
    endDate: literal('CURRENT_TIMESTAMP'),
    capacity: 10,
    price: 28.50
  },
  {
    name: "Weekly Watercolor",
    description: "It's finally wednesday again! Time to watercolor. Supplies provided for 5 dollars",
    type: "In Person",
    startDate: "2021-11-19 20:00:00.000 +00:00",
    endDate: literal('CURRENT_TIMESTAMP'),
    capacity: 10,
    price: 5
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const groupIds = await Group.findAll({
      attributes: ['id']
    });

    const venueIds = await Venue.findAll({
      attributes: ['id']
    });

    events.forEach((event, i) => {
      event.groupId = groupIds[i % groupIds.length].id;
      if(event.venueId !== null) event.venueId = venueIds[i % venueIds.length].id;
    });

    await Event.bulkCreate(events, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Events';
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(options, {
      name: { [Op.in]: ["Tennis Group First Meet and Greet", "Wake Boarding First Wave", "Weekly Watercolor"] }
    }, {});
  }
};
