'use strict';

const { EventImage } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const eventImages = [
  {
    eventId: 1,
    url: 'fake url',
    preview: true
  },
  {
    eventId: 2,
    url: 'fake url2',
    preview: false
  },
  {
    eventId: 3,
    url: 'fake url3',
    preview: false
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await EventImage.bulkCreate(eventImages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'EventImages';
    const { Op } =  Sequelize;
    await queryInterface.bulkDelete(options, {
      eventId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
