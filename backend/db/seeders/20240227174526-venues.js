'use strict';

const { Venue } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const venues = [
  {
    groupId: 1,
    address: "123 Disney Lane",
    city: "New York",
    state: "NY",
    lat: 37.7645358,
    lng: -122.4730327
  },
  {
    groupId: 2,
    address: "345 Wave Point",
    city: "San Diego",
    state: "CA",
    lat: 37.7645358,
    lng: -122.4730327
  },
  {
    groupId: 3,
    address: "456 Captain Dr",
    city: "Tampa",
    state: "FL",
    lat: 37.7645358,
    lng: -122.4730327
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Venue.bulkCreate(venues, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Venues';
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(options, {
      address: { [Op.in]: ["123 Disney Lane", "345 Wave Point", "456 Captain Dr"] }
    }, {});
  }
};