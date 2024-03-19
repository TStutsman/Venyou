'use strict';

const { literal } = require('sequelize');
const { Event, Group, Venue } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groupVenueEvents = [
  {
    name: 'Evening Tennis on the Water',
    address: null,
    events: [
      {
        name: "Tennis Group First Meet and Greet",
        description: "First meet and greet event for the evening tennis on the water group! Join us online for happy times!",
        type: "Online",
        startDate: "2024-02-27 17:44:32.455 +00:00",
        endDate: literal('CURRENT_TIMESTAMP'),
        capacity: 10,
        price: 0
      }
    ]
  },
  {
    name: 'Evening Tennis on the Water',
    address: '123 Disney Lane',
    events: [
      {
        name: "Tennis Group Monthly Meeting",
        description: "We're getting together again! Join us at the courts!",
        type: "In Person",
        startDate: "2024-03-27 17:44:32.455 +00:00",
        endDate: literal('CURRENT_TIMESTAMP'),
        capacity: 20,
        price: 0
      }
    ]
  },
  {
    name: 'Evening Tennis on the Water',
    address: '123 Disney Lane',
    events: [
      {
        name: "Tennis Group Monthly Meeting",
        description: "We're getting together again! Join us at the courts!",
        type: "In Person",
        startDate: "2024-04-27 17:44:32.455 +00:00",
        endDate: literal('CURRENT_TIMESTAMP'),
        capacity: 20,
        price: 0
      }
    ]
  },
  {
    name: 'Wake Boarding Classes',
    address: '345 Wave Point',
    events: [
      {
        name: "Wake Boarding First Wave",
        description: "First time this season out on the water! Beginners welcome",
        type: "In Person",
        startDate: "2021-11-19 20:00:00.000 +00:00",
        endDate: literal('CURRENT_TIMESTAMP'),
        capacity: 10,
        price: 28.50
      }
    ]
  },
  {
    name: 'Watercolor Wednesdays',
    address: '456 Captain Dr',
    events: [
      {
        name: "Weekly Watercolor",
        description: "It's finally wednesday again! Time to watercolor. Supplies provided for 5 dollars",
        type: "In Person",
        startDate: "2021-11-19 20:00:00.000 +00:00",
        endDate: literal('CURRENT_TIMESTAMP'),
        capacity: 10,
        price: 5
      }
    ]
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for(let groupVenueEvent of groupVenueEvents) {
      const { name, address, events } = groupVenueEvent;
      const group = await Group.findOne({ where: { name }});
      
      let venue;
      if(address !== null) {
        venue = await Venue.findOne({ where: { address }});
      } else venue = { id: null };

      for(let event of events) {
        await group.createEvent({ ...event, venueId: venue.id }, { validate: true });
      }
    }

    // await Event.bulkCreate(events, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let groupVenueEvent of groupVenueEvents) {
      const { events } = groupVenueEvent;

      for(let event of events) {
        let where = event;
        delete where.startDate;
        delete where.endDate;
        await Event.destroy({ where });
      }
    }
  }
};
