'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    
    static associate(models) {
      Event.belongsTo(models.Group, {
        foreignKey: 'groupId'
      });

      Event.hasMany(models.Attendance, {
        foreignKey: 'eventId'
      });

      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: 'eventId',
        otherKey: 'userId'
      });

      Event.belongsTo(models.Venue);

      Event.hasMany(models.EventImage, {
        foreignKey: 'eventId',
        onDelete: 'CASCADE',
        hooks: true
      });
    }
  }
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: {
          tableName: 'Venues'
        }
      },
      // TODO: needs additional tweaks and testing
      // validate: {
      //   nullIfOnline(value) {
      //     if(value === null && this.type !== 'Online') {
      //       throw new Error('Venue can only be null when Online');
      //     }
      //   }
      // }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'Groups'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM('Online', 'In Person'),
      allowNull: false
    },
    capacity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};