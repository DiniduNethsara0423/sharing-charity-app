const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const routes = require('./routes');
const { sequelize } = require('./models');
const responseFormatter = require('./middleware/responseFormatter');
const requestLogger = require('./middleware/requestLogger');
const path = require('path');
const fs = require('fs');

const app = express();

// Accept larger JSON payloads (base64 images or large objects). Adjust as needed.
app.use(express.json({ limit: '10mb' }));
// Also accept larger URL-encoded payloads (forms). Keep consistent with JSON limit.
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// requestLogger logs request/response details to logs/requests.log and console
app.use(requestLogger);
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

// Serve uploaded files (existing uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve generated/external images from configurable folder at /images
const IMAGE_STORAGE_PATH = process.env.IMAGE_STORAGE_PATH || path.resolve(__dirname, '..', 'external_uploads');
ensureDir = (dir) => { if (!require('fs').existsSync(dir)) require('fs').mkdirSync(dir, { recursive: true }); };
ensureDir(IMAGE_STORAGE_PATH);
app.use('/images', express.static(IMAGE_STORAGE_PATH));

// Serve admin SPA (single-file React build in src/admin)
const adminStaticPath = path.join(__dirname, 'admin');
if (fs.existsSync(adminStaticPath)) {
  app.use('/admin', express.static(adminStaticPath));
  app.get('/admin/*', (req, res) => res.sendFile(path.join(adminStaticPath, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  // Send unified error response
  res.status(500).json({ success: false, code: 500, message: 'Internal Server Error', data: null });
});

module.exports = app;
