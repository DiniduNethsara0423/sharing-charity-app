const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = (subfolder = '') => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', subfolder);
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});

const single = (field = 'image', subfolder = '') => multer({ storage: storage(subfolder) }).single(field);

// Memory-storage variant: keeps file buffer in `req.file.buffer` so callers
// can convert to base64 and store in DB instead of writing to disk.
const singleMemory = (field = 'image') => multer({ storage: multer.memoryStorage() }).single(field);

module.exports = { single, singleMemory };
