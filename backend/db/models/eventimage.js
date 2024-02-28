'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EventImage extends Model {
    
    static associate(models) {
      EventImage.belongsTo(models.Event, {
        foreignKey: 'id'
      });
    }
  }
  EventImage.init({
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'Events'
        }
      },
      onDelete: 'CASCADE'
    },
    url: DataTypes.STRING,
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'EventImage',
  });
  return EventImage;
};