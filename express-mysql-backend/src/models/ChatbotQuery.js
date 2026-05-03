const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const ChatbotQuery = sequelize.define('ChatbotQuery', {
  query_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
  },
  intent: {
    type: DataTypes.STRING(100),
  },
}, {
  tableName: 'chatbot_query',
  timestamps: true,
  underscored: true,
});

module.exports = ChatbotQuery;
