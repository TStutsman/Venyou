'use strict';

const { GroupImage, Group } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const groupImages = [
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
    const groupIds = await Group.findAll({
      attributes: ['id']
    });

    groupImages.forEach((image, i) => {
      image.groupId = groupIds[i % groupIds.length].id;
    });

    toDelete = groupIds.map(group => group.id);

    await GroupImage.bulkCreate(groupImages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    const { Op } =  Sequelize;
    await queryInterface.bulkDelete(options, {
      groupId: { [Op.in]: toDelete }
    }, {});
  }
};
