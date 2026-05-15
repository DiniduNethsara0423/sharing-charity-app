const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT) || 10000;
const poolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charity_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout,
};

if (process.env.DB_SSL === 'true') {
  if (process.env.DB_SSL_CA_PATH) {
    try {
      const caPath = path.isAbsolute(process.env.DB_SSL_CA_PATH)
        ? process.env.DB_SSL_CA_PATH
        : path.resolve(__dirname, '../../', process.env.DB_SSL_CA_PATH);
      if (fs.existsSync(caPath)) {
        poolOptions.ssl = { ca: fs.readFileSync(caPath, 'utf8') };
      } else {
        poolOptions.ssl = { rejectUnauthorized: false };
      }
    } catch (err) {
      poolOptions.ssl = { rejectUnauthorized: false };
    }
  } else if (process.env.DB_SSL_CA) {
    poolOptions.ssl = { ca: process.env.DB_SSL_CA };
  } else if (process.env.DB_SSL_ALLOW_SELF_SIGNED === 'true') {
    poolOptions.ssl = { rejectUnauthorized: false };
  } else {
    poolOptions.ssl = { rejectUnauthorized: true };
  }
}

const pool = mysql.createPool(poolOptions);

module.exports = pool;
