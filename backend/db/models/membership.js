'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    
    static associate(models) {
      Membership.belongsTo(models.Group, {
        foreignKey: 'groupId'
      });
      Membership.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }
  }
  Membership.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users'
      },
      onDelete: 'CASCADE'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups'
      },
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('organizer', 'co-host', 'member', 'pending'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};