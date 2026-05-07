const { Item, User, Category, Transaction } = require('../models');

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
    res.status(200).json({ success: true, code: 200, message: 'OK', data: items });
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
      }],
    });
    if (!item) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: item });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file) payload.image = `/uploads/items/${req.file.filename}`;

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
        attributes: ['user_id', 'username', 'email'],
      }],
    });
    res.status(201).json({ success: true, code: 201, message: 'Created', data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    const payload = { ...req.body };
    if (req.file) payload.image = `/uploads/items/${req.file.filename}`;
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
    res.status(200).json({ success: true, code: 200, message: 'OK', data: result });
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