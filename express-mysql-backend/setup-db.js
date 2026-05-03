const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const sqlFile = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
  const statements = sqlFile.split(';').filter(stmt => stmt.trim());

  for (const statement of statements) {
    try {
      await connection.query(statement);
      console.log('✓ Executed:', statement.split('\n')[0].substring(0, 50));
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  await connection.end();
  console.log('\n✓ Database setup complete!');
}

setupDatabase().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
