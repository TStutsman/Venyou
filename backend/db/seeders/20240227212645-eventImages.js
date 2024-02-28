'use strict';

const { EventImage, Event } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const eventImages = [
  {
    url: 'fake url',
    preview: true
  },
  {
    url: 'fake url2',
    preview: false
  },
  {
    url: 'fake url3',
    preview: false
  }
];

let toDelete;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const eventIds = await Event.findAll({
      attributes: ['id']
    });

    eventImages.forEach((image, i) => {
      image.eventId = eventIds[i % eventIds.length].id;
    });

    toDelete = eventIds.map(event => event.id);

    await EventImage.bulkCreate(eventImages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'EventImages';
    const { Op } =  Sequelize;
    await queryInterface.bulkDelete(options, {
      eventId: { [Op.in]: toDelete }
    }, {});
  }
};
