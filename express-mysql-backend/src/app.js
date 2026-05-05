const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const routes = require('./routes');
const { sequelize } = require('./models');
const responseFormatter = require('./middleware/responseFormatter');

const app = express();

app.use(express.json());
app.use(morgan('dev'));
// Standardize JSON responses for all routes
app.use(responseFormatter);
// Enable CORS for all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    return res.status(200).end();
  }
  next();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(routes);

// Serve uploaded files
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  console.error(err);
  // Send unified error response
  res.status(500).json({ success: false, code: 500, message: 'Internal Server Error', data: null });
});

module.exports = app;
