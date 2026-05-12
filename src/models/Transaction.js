const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Transaction = sequelize.define('Transaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'item',
      key: 'item_id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  type: {
    type: DataTypes.STRING(50),
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'failed', 'cancelled']],
    },
  },
}, {
  tableName: 'transaction',
  timestamps: true,
  underscored: true,
});

module.exports = Transaction;
