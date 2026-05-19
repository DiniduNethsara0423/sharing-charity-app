const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const poolOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'charity_app',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 10000,
  };

  if (process.env.DB_SSL === 'true') {
    if (process.env.DB_SSL_CA_PATH) {
      try {
        const caPath = path.isAbsolute(process.env.DB_SSL_CA_PATH)
          ? process.env.DB_SSL_CA_PATH
          : path.resolve(__dirname, '../', process.env.DB_SSL_CA_PATH);
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

  const connection = await mysql.createConnection(poolOptions);

  try {
    await connection.query('ALTER TABLE category ADD COLUMN IF NOT EXISTS sizes TEXT NULL');
    await connection.query('ALTER TABLE item ADD COLUMN IF NOT EXISTS size VARCHAR(20) NULL');
    console.log('Migration applied: category.sizes and item.size are available');
  } finally {
    await connection.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});