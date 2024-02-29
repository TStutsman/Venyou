'use strict';

const { Group, User } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const userGroups = [
  {
    username: 'FakeUser1',
    groups: [
      {
        name: "Evening Tennis on the Water",
        about: "Enjoy rounds of tennis with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
        type: "In Person",
        private: true,
        city: "New York",
        state: "NY",
      },
      {
        name: "Wake Boarding Classes",
        about: "Get out on the water and learn to wake board like a pro",
        type: "In Person",
        private: true,
        city: "San Diego",
        state: "CA",
      }
    ]
  },
  {
    username: 'FakeUser2',
    groups: [
      {
        name: "Watercolor Wednesdays",
        about: "Meet every wednesday to make watercolor together and listen to jazz",
        type: "In Person",
        private: true,
        city: "Tampa",
        state: "FL",
      }
    ]
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for(let userGroup of userGroups) {
      const { username, groups } = userGroup;
      const user = await User.findOne({ where: { username } });

      for(let group of groups) {
        await Group.create({ ...group, organizerId: user.id }, { validate: true });
      }
    }

    // await Group.bulkCreate(groups, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    for(let userGroup of userGroups) {
      const { groups } = userGroup;

      for(let group of groups) {
        let where = group;
        await Group.destroy({ where });
      }
    }
  }
};
