const { User, Category, Item } = require('../models');

function sendBase64DataUrl(res, dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return res.status(404).end();
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return res.status(415).end();
  const mime = m[1];
  const b64 = m[2];
  const buf = Buffer.from(b64, 'base64');
  res.set('Content-Type', mime);
  res.set('Content-Length', buf.length);
  return res.send(buf);
}

exports.userImage = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || !user.image) return res.status(404).end();
    const img = user.image;
    if (img.startsWith('data:')) return sendBase64DataUrl(res, img);
    // otherwise serve existing file path (served under /uploads or /images)
    // If img is absolute URL, redirect; if path, redirect to it.
    return res.redirect(img);
  } catch (err) { next(err); }
};

exports.categoryImage = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category || !category.image) return res.status(404).end();
    const img = category.image;
    if (img.startsWith('data:')) return sendBase64DataUrl(res, img);
    return res.redirect(img);
  } catch (err) { next(err); }
};

exports.itemImage = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item || !item.image) return res.status(404).end();
    const img = item.image;
    if (img.startsWith('data:')) return sendBase64DataUrl(res, img);
    return res.redirect(img);
  } catch (err) { next(err); }
};
