'use strict';

const { Membership, Group, User} =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const memberships = [
  {
    status: 'organizer'
  },
  {
    status: 'member'
  },
  {
    status: 'organizer'
  },
  {
    status: 'organizer'
  },
  {
    status: 'member'
  }
];

let toDelete;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const groupIds = await Group.findAll({
      attributes: ['id']
    });
    const userIds = await User.findAll({
      attributes: ['id']
    });

    toDelete = userIds.map(user => user.id);

    memberships.forEach((member, i) => {
      member.groupId = groupIds[i % groupIds.length].id;
      member.userId = userIds[i % userIds.length].id;
    });

    Membership.bulkCreate(memberships, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    const { Op } = Sequelize;
    await queryInterface.bulkDelete(options, {
      userId: { [Op.in]: toDelete }
    }, {});
  }
};
