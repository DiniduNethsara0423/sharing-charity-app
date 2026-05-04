const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Conversation = sequelize.define('Conversation', {
  conversation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  participant_one_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  participant_two_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  charity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'charity',
      key: 'charity_id',
    },
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'item',
      key: 'item_id',
    },
    onDelete: 'SET NULL',
  },
  context_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'sale',
    validate: {
      isIn: [['sale', 'donation']],
    },
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'closed']],
    },
  },
  last_message_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'conversation',
  timestamps: true,
  underscored: true,
});

module.exports = Conversation;