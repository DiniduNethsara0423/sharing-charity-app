const { Category } = require('../models');

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function isClothingCategory(name) {
  return String(name || '').trim().toLowerCase() === 'clothing';
}

function parseSizes(input) {
  if (Array.isArray(input)) {
    return input.map(size => String(size).trim().toUpperCase()).filter(Boolean);
  }

  if (input === null || input === undefined) {
    return [];
  }

  if (typeof input !== 'string') {
    return parseSizes(String(input));
  }

  const trimmed = input.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map(size => String(size).trim().toUpperCase()).filter(Boolean);
    }
  } catch (err) {
    // Fall through to comma-separated parsing.
  }

  return trimmed
    .split(',')
    .map(size => String(size).trim().toUpperCase())
    .filter(Boolean);
}

function normalizeCategory(category) {
  const response = category.toJSON();
  response.sizes = parseSizes(response.sizes);
  return response;
}

function extractSizes(categoryName, sizesInput, fallbackSizes) {
  if (!isClothingCategory(categoryName)) {
    return null;
  }

  const chosenSizes = sizesInput !== undefined ? parseSizes(sizesInput) : parseSizes(fallbackSizes);
  const uniqueSizes = [...new Set(chosenSizes)];

  if (!uniqueSizes.length) {
    return [];
  }

  const invalid = uniqueSizes.filter(size => !CLOTHING_SIZES.includes(size));
  if (invalid.length) {
    return { error: `Invalid sizes: ${invalid.join(', ')}` };
  }

  return uniqueSizes;
}

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['created_at', 'DESC']] });
    const rows = categories.map(normalizeCategory);
    // Keep image field as stored (data URL or path). Frontend can use data URL directly.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, code: 404, message: 'Category not found', data: null });
    const response = normalizeCategory(category);
    // Return stored image value (data URL or path) directly without saving files.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: response });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const category_name = req.body.category_name || req.body.categoryName;
    const sizes = extractSizes(category_name, req.body.sizes);
    let image = null;
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      image = `data:${req.file.mimetype};base64,${b64}`;
    }
    if (!category_name) return res.status(400).json({ success: false, code: 400, message: 'category_name required', data: null });
    if (sizes && sizes.error) {
      return res.status(400).json({ success: false, code: 400, message: sizes.error, data: null });
    }
    if (isClothingCategory(category_name) && Array.isArray(sizes) && !sizes.length) {
      return res.status(400).json({ success: false, code: 400, message: 'sizes required for Clothing category', data: null });
    }
    const category = await Category.create({
      category_name,
      image,
      sizes: sizes ? JSON.stringify(sizes) : null,
    });
    res.status(201).json({ success: true, code: 201, message: 'Created', data: normalizeCategory(category) });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, code: 404, message: 'Category not found', data: null });
    let image = category.image;
    const nextName = req.body.category_name || req.body.categoryName || category.category_name;
    const sizes = extractSizes(nextName, req.body.sizes, category.sizes);
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      image = `data:${req.file.mimetype};base64,${b64}`;
    }
    if (sizes && sizes.error) {
      return res.status(400).json({ success: false, code: 400, message: sizes.error, data: null });
    }
    if (isClothingCategory(nextName) && Array.isArray(sizes) && !sizes.length) {
      return res.status(400).json({ success: false, code: 400, message: 'sizes required for Clothing category', data: null });
    }
    await category.update({
      category_name: nextName,
      image,
      sizes: isClothingCategory(nextName) ? JSON.stringify(sizes || parseSizes(category.sizes)) : null,
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: normalizeCategory(category) });
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
