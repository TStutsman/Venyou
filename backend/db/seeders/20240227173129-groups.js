'use strict';

const { Group } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groups = [
  {
    organizerId: 1,
    name: "Evening Tennis on the Water",
    about: "Enjoy rounds of tennis with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
    type: "In Person",
    private: true,
    city: "New York",
    state: "NY",
    previewImage: "image url",
  },
  {
    organizerId: 2,
    name: "Wake Boarding Classes",
    about: "Get out on the water and learn to wake board like a pro",
    type: "In Person",
    private: true,
    city: "San Diego",
    state: "CA",
    previewImage: "image url",
  },
  {
    organizerId: 3,
    name: "Watercolor Wednesdays",
    about: "Meet every wednesday to make watercolor together and listen to jazz",
    type: "In Person",
    private: true,
    city: "Tampa",
    state: "FL",
    previewImage: "image url",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Group.bulkCreate(groups, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(options, {
      name: { [Op.in]: ["Evening Tennis on the Water", "Wake Boarding Classes", "Watercolor Wednesdays"] }
    }, {});
  }
};
