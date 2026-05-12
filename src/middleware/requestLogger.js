const fs = require('fs');
const path = require('path');

function maskHeaders(headers) {
  const copy = { ...headers };
  if (copy.authorization) copy.authorization = 'REDACTED';
  return copy;
}

module.exports = function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.connection && req.connection.remoteAddress,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: maskHeaders(req.headers),
    };

    try {
      const logsDir = path.join(__dirname, '../../logs');
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
      const file = path.join(logsDir, 'requests.log');
      fs.appendFile(file, JSON.stringify(log) + '\n', (err) => {
        if (err) console.error('Failed to write request log', err);
      });
    } catch (err) {
      console.error('Request logger error', err);
    }

    // Also print a short line to console for development
    console.log(`${log.timestamp} ${log.method} ${log.url} ${log.status} ${log.durationMs}ms`);
  });

  next();
};
