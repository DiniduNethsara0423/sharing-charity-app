const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const routes = require('./routes');
const { sequelize } = require('./models');

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(routes);

// Sequelize sync before starting server
app.use(async (req, res, next) => {
  try {
    if (!app.locals.dbSynced) {
      await sequelize.sync();
      app.locals.dbSynced = true;
      console.log('✓ Database synchronized');
    }
    next();
  } catch (error) {
    console.error('Database sync error:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
