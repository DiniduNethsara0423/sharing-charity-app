const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Message = sequelize.define('Message', {
  message_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'conversation',
      key: 'conversation_id',
    },
    onDelete: 'SET NULL',
  },
  item_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'item',
      key: 'item_id',
    },
    onDelete: 'SET NULL',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  encrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'message',
  timestamps: true,
  underscored: true,
});

module.exports = Message;
