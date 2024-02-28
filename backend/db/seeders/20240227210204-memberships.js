'use strict';

const { Membership } =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const memberships = [
  {
    userId: 5,
    groupId: 1,
    status: 'organizer'
  },
  {
    userId: 6,
    groupId: 1,
    status: 'member'
  },
  {
    userId: 7,
    groupId: 3,
    status: 'organizer'
  },
  {
    userId: 7,
    groupId: 2,
    status: 'organizer'
  },
  {
    userId: 6,
    groupId: 2,
    status: 'member'
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    Membership.bulkCreate(memberships, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [5, 6, 7] }
    }, {});
  }
};
