'use strict';

const { GroupImage, Group } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groupImages = [
  {
    name: 'Evening Tennis on the Water',
    url: 'fake url',
    preview: true
  },
  {
    name: 'Wake Boarding Classes',
    url: 'fake url2',
    preview: false
  },
  {
    name: 'Watercolor Wednesdays',
    url: 'fake url3',
    preview: false
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for(let groupImage of groupImages) {
      const { name, url, preview } = groupImage;
      const group = await Group.findOne({ where: { name } });

      await GroupImage.create({ url, preview, groupId: group.id }, { validate: true });
    }

    // await GroupImage.bulkCreate(groupImages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let groupImage of groupImages) {
      const { name, url, preview } = groupImage;
      const group = await Group.findOne({ where: { name } });

      await GroupImage.destroy({ where: { url, preview, groupId: group.id } });
    }
  }
};
