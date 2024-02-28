'use strict';

const { literal } = require('sequelize');
const { Event, Group, Venue } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groupVenueEvents = [
  {
    groupName: 'Evening Tennis on the Water',
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
    groupName: 'Wake Boarding Classes',
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
    groupName: 'Watercolor Wednesdays',
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
      const { groupName, address, events } = groupVenueEvent;
      const group = await Group.findOne({ where: { name: groupName }});
      const venue = address === null ? { id: null } : await Venue.findOne({ where: { address }});

      for(let event of events) {
        await Event.create({ ...event, venueId: venue.id, groupId: group.id }, { validate: true });
      }
    }

    // await Event.bulkCreate(events, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let groupVenueEvent of groupVenueEvents) {
      const { groupName, address, events } = groupVenueEvent;
      const group = await Group.findOne({ where: { name: groupName }});
      const venue = address === null ? { id: null } : await Venue.findOne({ where: { address }});

      for(let event of events) {
        await Event.destroy({ where: { ...event, venueId: venue.id, groupId: group.id } });
      }
    }
  }
};
