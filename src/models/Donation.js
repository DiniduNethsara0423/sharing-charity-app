const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Donation = sequelize.define('Donation', {
  donation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  donor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'user_id',
    },
  },
  charity_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'charity',
      key: 'charity_id',
    },
  },
  item_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'item',
      key: 'item_id',
    },
    onDelete: 'SET NULL',
  },
  item_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  item_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  item_category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'category',
      key: 'category_id',
    },
  },
  item_size: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  item_image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'cancelled']],
    },
  },
  gift_location: {
    type: DataTypes.STRING(255),
  },
  impact: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'donation',
  timestamps: true,
  underscored: true,
});

module.exports = Donation;
