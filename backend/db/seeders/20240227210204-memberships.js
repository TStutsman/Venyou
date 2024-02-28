'use strict';

const { Membership, Group, User} =  require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const userGroupMemberships = [
  {
    username: 'FakeUser1',
    name: 'Evening Tennis on the Water',
    status: 'organizer'
  },
  {
    username: 'FakeUser1',
    name: 'Wake Boarding Classes',
    status: 'member'
  },
  {
    username: 'FakeUser2',
    name: 'Wake Boarding Classes',
    status: 'organizer'
  },
  {
    username: 'FakeUser2',
    name: 'Watercolor Wednesdays',
    status: 'organizer'
  },
  {
    username: 'Demo-lition',
    name: 'Watercolor Wednesdays',
    status: 'member'
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for(let userGroupMembership of userGroupMemberships) {
      const { username, name, status } = userGroupMembership;
      const group = await Group.findOne({ where: { name: name }});
      const user =  await User.findOne({ where: { username }});

      await Membership.create({ status, userId: user.id, groupId: group.id }, { validate: true });
    }

    // Membership.bulkCreate(memberships, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let userGroupMembership of userGroupMemberships) {
      const { username, name, status } = userGroupMembership;
      const group = await Group.findOne({ where: { name: name }});
      const user =  await User.findOne({ where: { username }});

      await Membership.destroy({ where: { status, userId: user.id, groupId: group.id } });
    }
  }
};
