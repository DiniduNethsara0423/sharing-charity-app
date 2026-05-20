const { Item, User, Category, Transaction } = require('../models');

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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

function normalizeSize(value) {
  return String(value || '').trim().toUpperCase();
}

function isClothingCategory(category) {
  return Boolean(category && String(category.category_name || '').trim().toLowerCase() === 'clothing');
}

function normalizeCategory(category) {
  const response = { ...category };
  response.sizes = parseSizes(response.sizes);
  return response;
}

function normalizeItem(item) {
  const response = item.toJSON();
  if (response.category) {
    response.category = normalizeCategory(response.category);
    response.available_sizes = isClothingCategory(response.category) ? response.category.sizes : [];
  } else {
    response.available_sizes = [];
  }
  return response;
}

async function resolveItemCategory(payload, fallbackCategoryId) {
  const categoryId = payload.category_id || payload.categoryId || fallbackCategoryId || null;
  if (!categoryId) {
    return { category: null, categoryId: null };
  }

  const category = await Category.findByPk(categoryId);
  return { category, categoryId };
}

function validateItemSize(category, requestedSize, currentSize) {
  if (!isClothingCategory(category)) {
    return { size: null };
  }

  const allowedSizes = parseSizes(category.sizes);
  if (!allowedSizes.length) {
    return { error: 'No sizes configured for Clothing category' };
  }

  const normalizedSize = normalizeSize(requestedSize || currentSize);
  if (!normalizedSize) {
    return { error: 'size required for Clothing items' };
  }

  if (!allowedSizes.includes(normalizedSize) || !CLOTHING_SIZES.includes(normalizedSize)) {
    return { error: `Invalid size. Allowed sizes: ${allowedSizes.join(', ')}` };
  }

  return { size: normalizedSize };
}

exports.list = async (req, res, next) => {
  try {
    const { categoryId, status, q } = req.query;
    const where = {};
    if (categoryId) where.category_id = categoryId;
    if (status === 'sold') where.status = 'sold';
    if (status === 'unsold') where.status = 'active';
    if (q) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    const items = await Item.findAll({
      where,
      include: [
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Category, as: 'category' }
      ],
      order: [['created_at', 'DESC']],
    });
    const rows = items.map(normalizeItem);
    // Keep image fields as stored (data URLs or paths). Frontend can use data URLs directly.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.listBySeller = async (req, res, next) => {
  try {
    const items = await Item.findAll({
      where: { seller_id: req.params.sellerId },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['user_id', 'username', 'email'],
      }],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: items });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['user_id', 'username', 'email'],
      }, { model: Category, as: 'category' }],
    });
    if (!item) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    const response = normalizeItem(item);
    // Return image fields as stored (data URL or path) without writing files.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: response });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.categoryId && !payload.category_id) {
      payload.category_id = payload.categoryId;
    }
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      payload.image = `data:${req.file.mimetype};base64,${b64}`;
    }

    const { category } = await resolveItemCategory(payload);
    const sizeCheck = validateItemSize(category, payload.size);
    if (sizeCheck.error) {
      return res.status(400).json({ success: false, code: 400, message: sizeCheck.error, data: null });
    }
    if (sizeCheck.size) {
      payload.size = sizeCheck.size;
    } else {
      delete payload.size;
    }

    // Normalize status value to match model allowed values
    if (payload.status && typeof payload.status === 'string') {
      let s = payload.status.trim().toLowerCase();
      // Remove surrounding quotes if present
      if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
        s = s.slice(1, -1).trim();
      }
      if (s === 'unsold' || s === 'available' || s === 'ok') s = 'active';
      if (!['active', 'inactive', 'sold'].includes(s)) {
        delete payload.status; // let default apply
      } else {
        payload.status = s;
      }
    }

    const item = await Item.create(payload);
    const result = await Item.findByPk(item.item_id, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['user_id', 'username', 'email', 'device_token'],
      }, {
        model: Category,
        as: 'category',
      }],
    });
    try {
      const { sendToUser } = require('../services/fcmService');
      if (result && result.seller) {
        await sendToUser(
          result.seller,
          { title: 'Item Added Successfully', body: `Your item "${result.title}" was added successfully.` },
          { type: 'item_created', item_id: String(result.item_id) }
        );
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
    res.status(201).json({ success: true, code: 201, message: 'Created', data: normalizeItem(result) });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    const payload = { ...req.body };
    if (payload.categoryId && !payload.category_id) {
      payload.category_id = payload.categoryId;
    }
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      payload.image = `data:${req.file.mimetype};base64,${b64}`;
    }
    const { category } = await resolveItemCategory(payload, item.category_id);
    const sizeCheck = validateItemSize(category, payload.size, item.size);
    if (sizeCheck.error) {
      return res.status(400).json({ success: false, code: 400, message: sizeCheck.error, data: null });
    }
    if (sizeCheck.size) {
      payload.size = sizeCheck.size;
    } else {
      delete payload.size;
    }
    // Normalize status like in create
    if (payload.status && typeof payload.status === 'string') {
      let s = payload.status.trim().toLowerCase();
      if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
        s = s.slice(1, -1).trim();
      }
      if (s === 'unsold' || s === 'available' || s === 'ok') s = 'active';
      if (!['active', 'inactive', 'sold'].includes(s)) {
        delete payload.status;
      } else {
        payload.status = s;
      }
    }

    await item.update(payload);
    const result = await Item.findByPk(req.params.id, {
      include: [
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Category, as: 'category' }
      ],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: normalizeItem(result) });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    
    await item.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};

exports.stats = async (req, res, next) => {
  try {
    // total sold items and income from completed transactions
    const totalSold = await Transaction.count({ where: { status: 'completed' } });
    const totalIncomeRow = await Transaction.findAll({
      attributes: [[Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total_income']],
      where: { status: 'completed' },
      raw: true,
    });
    const totalIncome = totalIncomeRow && totalIncomeRow[0] ? parseFloat(totalIncomeRow[0].total_income || 0) : 0;

    // total buy count (transactions with type 'buy' completed)
    const totalBuyCount = await Transaction.count({ where: { status: 'completed', type: 'buy' } });

    res.status(200).json({ success: true, code: 200, message: 'OK', data: { totalSold, totalIncome, totalBuyCount } });
  } catch (err) { next(err); }
};