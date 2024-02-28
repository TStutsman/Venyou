'use strict';

const { GroupImage } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groupImages = [
  {
    groupId: 1,
    url: 'fake url',
    preview: true
  },
  {
    groupId: 2,
    url: 'fake url2',
    preview: false
  },
  {
    groupId: 3,
    url: 'fake url3',
    preview: false
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await GroupImage.bulkCreate(groupImages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    const { Op } =  Sequelize;
    await queryInterface.bulkDelete(options, {
      groupId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
