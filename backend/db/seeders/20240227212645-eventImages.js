'use strict';

const { EventImage, Event } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const eventImages = [
  {
    name: 'Tennis Group First Meet and Greet',
    url: 'fake url',
    preview: true
  },
  {
    name: 'Wake Boarding First Wave',
    url: 'fake url2',
    preview: false
  },
  {
    name: 'Weekly Watercolor',
    url: 'fake url3',
    preview: false
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for(let eventImage of eventImages) {
      const { name, url, preview } = eventImage;
      const event = await Event.findOne({ where: { name } });

      await event.createEventImage({ url, preview }, { validate: true });
    }

    // await EventImage.bulkCreate(eventImages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let eventImage of eventImages) {
      const { name, url } = eventImage;
      const event = await Event.findOne({ where: { name } });

      await EventImage.destroy({ where: { url, eventId: event.id } });
    }
  }
};
