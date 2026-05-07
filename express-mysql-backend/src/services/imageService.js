const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

function mimeToExt(mime) {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  return map[mime] || 'bin';
}

async function ensureImageFile(modelName, id, dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return null;
  const mime = match[1];
  const b64 = match[2];
  const hash = crypto.createHash('sha1').update(b64).digest('hex').slice(0, 12);
  const ext = mimeToExt(mime);
  const filename = `${modelName}_${id}_${hash}.${ext}`;
  const storageDir = process.env.IMAGE_STORAGE_PATH || path.resolve(__dirname, '..', '..', 'external_uploads');
  ensureDir(storageDir);
  const filePath = path.join(storageDir, filename);
  if (!fs.existsSync(filePath)) {
    const buf = Buffer.from(b64, 'base64');
    await fs.promises.writeFile(filePath, buf);
  }
  // public url served at /images
  return `/images/${filename}`;
}

module.exports = { ensureImageFile };
