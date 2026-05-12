const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('./app');
const http = require('http');
const { initializeSocket } = require('./services/socket');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

(async () => {
  try {
    // Sync models to DB; use `alter` to update existing tables with missing columns
    await sequelize.sync({ alter: true });
    console.log('✓ Database synchronized (schema altered if needed)');

    // Seed default categories if they don't exist
    try {
      const { seedCategories } = require('./services/seedCategories');
      await seedCategories();
    } catch (err) {
      console.error('Category seeding failed:', err);
    }

    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();
