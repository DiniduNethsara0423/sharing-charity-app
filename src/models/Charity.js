const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Charity = sequelize.define('Charity', {
  charity_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  address: {
    type: DataTypes.STRING(255),
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  email: {
    type: DataTypes.STRING(100),
    validate: {
      isEmail: true,
    },
  },
}, {
  tableName: 'charity',
  timestamps: true,
  underscored: true,
});

module.exports = Charity;
