'use strict';

const { GroupImage, Group } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groupImages = [
  {
    name: 'Evening Tennis on the Water',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/tennis-img.jpeg',
    preview: true
  },
  {
    name: 'Wake Boarding Classes',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/Wakeboarding.webp',
    preview: true
  },
  {
    name: 'Watercolor Wednesdays',
    url: 'https://venyou-image-bucket.s3.us-east-2.amazonaws.com/watercolor.jpg',
    preview: true
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for(let groupImage of groupImages) {
      const { name, url, preview } = groupImage;
      const group = await Group.findOne({ where: { name } });

      await group.createGroupImage({ url, preview }, { validate: true });
    }

    // await GroupImage.bulkCreate(groupImages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let groupImage of groupImages) {
      const { name, url } = groupImage;
      const group = await Group.findOne({ where: { name } });

      await GroupImage.destroy({ where: { url, groupId: group.id } });
    }
  }
};
