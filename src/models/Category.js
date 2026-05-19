const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Category = sequelize.define('Category', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  sizes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'category',
  timestamps: true,
  underscored: true,
});

module.exports = Category;
