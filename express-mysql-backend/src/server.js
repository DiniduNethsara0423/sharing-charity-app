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
    await sequelize.sync();
    console.log('✓ Database synchronized');

    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();
