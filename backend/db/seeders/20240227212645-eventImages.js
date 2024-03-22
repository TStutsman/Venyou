'use strict';

const { EventImage, Event } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const eventImages = [
  {
    name: 'Tennis Group First Meet and Greet',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/wii-tennis.jpg',
    preview: true
  },
  {
    name: 'Tennis Group March Meeting',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/wii-tennis.jpg',
    preview: true
  },
  {
    name: 'Tennis Group April Meeting',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/wii-tennis.jpg',
    preview: true
  },
  {
    name: 'Wake Boarding First Wave',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/wii-wakeboarding.jpeg',
    preview: true
  },
  {
    name: 'Weekly Watercolor',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/watercolor2.jpg',
    preview: true
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
