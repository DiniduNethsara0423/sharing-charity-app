const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT) || 10000;
const dialectOptions = { connectTimeout };

if (process.env.DB_SSL === 'true') {
  // Priority: DB_SSL_CA_PATH (file) -> DB_SSL_CA (raw cert) -> allow self-signed flag -> strict
  if (process.env.DB_SSL_CA_PATH) {
    try {
      const caPath = path.isAbsolute(process.env.DB_SSL_CA_PATH)
        ? process.env.DB_SSL_CA_PATH
        : path.resolve(__dirname, process.env.DB_SSL_CA_PATH);
      if (fs.existsSync(caPath)) {
        dialectOptions.ssl = { ca: fs.readFileSync(caPath, 'utf8') };
      } else {
        dialectOptions.ssl = { rejectUnauthorized: false };
      }
    } catch (err) {
      dialectOptions.ssl = { rejectUnauthorized: false };
    }
  } else if (process.env.DB_SSL_CA) {
    dialectOptions.ssl = { ca: process.env.DB_SSL_CA };
  } else if (process.env.DB_SSL_ALLOW_SELF_SIGNED === 'true') {
    dialectOptions.ssl = { rejectUnauthorized: false };
  } else {
    dialectOptions.ssl = { rejectUnauthorized: true };
  }
}

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialectOptions,
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

module.exports = sequelize;
