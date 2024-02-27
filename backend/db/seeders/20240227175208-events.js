'use strict';

const { Event, Sequelize } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const events = [
  {
    groupId: 1,
    venueId: null,
    name: "Tennis Group First Meet and Greet",
    description: "First meet and greet event for the evening tennis on the water group! Join us online for happy times!",
    type: "Online",
    startDate: "2024-02-27 17:44:32.455 +00:00",
    endDate: Sequelize.literal('CURRENT_TIMESTAMP'),
    capacity: 10,
    price: 0
  },
  {
    groupId: 2,
    venueId: 2,
    name: "Wake Boarding First Wave",
    description: "First time this season out on the water! Beginners welcome",
    type: "In Person",
    startDate: "2021-11-19 20:00:00.000 +00:00",
    endDate: Sequelize.literal('CURRENT_TIMESTAMP'),
    capacity: 10,
    price: 28.50
  },
  {
    groupId: 3,
    venueId: 3,
    name: "Weekly Watercolor",
    description: "It's finally wednesday again! Time to watercolor. Supplies provided for 5 dollars",
    type: "In Person",
    startDate: "2021-11-19 20:00:00.000 +00:00",
    endDate: Sequelize.literal('CURRENT_TIMESTAMP'),
    capacity: 10,
    price: 5
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
