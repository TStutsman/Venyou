'use strict';

const { Venue, Group } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groupVenues = [
  {
    name: 'Evening Tennis on the Water',
    venues: [
      {
        address: "123 Disney Lane",
        city: "New York",
        state: "NY",
        lat: 37.7645358,
        lng: -122.4730327
      }
    ]
  },
  {
    name: 'Wake Boarding Classes',
    venues: [
      {
        address: "345 Wave Point",
        city: "San Diego",
        state: "CA",
        lat: 37.7645358,
        lng: -122.4730327
      }
    ]
  },
  {
    name: 'Watercolor Wednesdays',
    venues: [
      {
        address: "456 Captain Dr",
        city: "Tampa",
        state: "FL",
        lat: 37.7645358,
        lng: -122.4730327
      }
    ]
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for(let groupVenue of groupVenues) {
      const { name, venues } = groupVenue;
      const group = await Group.findOne({ where: { name } });

      for(let venue of venues) {
        await group.createVenue({ ...venue }, { validate: true });
      }
    }

    // await Venue.bulkCreate(venues, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let groupVenue of groupVenues) {
      const { venues } = groupVenue;

      for(let venue of venues) {
        let where = venue;
        await Venue.destroy({ where });
      }
    }
  }
};
