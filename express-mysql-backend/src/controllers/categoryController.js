const { Category } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['created_at', 'DESC']] });
    const rows = categories.map(c => c.toJSON());
    // Keep image field as stored (data URL or path). Frontend can use data URL directly.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, code: 404, message: 'Category not found', data: null });
    const response = category.toJSON();
    // Return stored image value (data URL or path) directly without saving files.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: response });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { category_name } = req.body;
    let image = null;
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      image = `data:${req.file.mimetype};base64,${b64}`;
    }
    if (!category_name) return res.status(400).json({ success: false, code: 400, message: 'category_name required', data: null });
    const category = await Category.create({ category_name, image });
    res.status(201).json({ success: true, code: 201, message: 'Created', data: category });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, code: 404, message: 'Category not found', data: null });
    let image = category.image;
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      image = `data:${req.file.mimetype};base64,${b64}`;
    }
    await category.update({ category_name: req.body.category_name || category.category_name, image });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: category });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, code: 404, message: 'Category not found', data: null });
    await category.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) { next(err); }
};
