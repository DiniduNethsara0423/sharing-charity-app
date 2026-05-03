const { Item, User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const items = await Item.findAll({
      include: [{
        model: User,
        as: 'seller',
        attributes: ['user_id', 'username', 'email'],
      }],
      order: [['created_at', 'DESC']],
    });
    res.json(items);
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
    res.json(items);
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
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    const result = await Item.findByPk(item.item_id, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['user_id', 'username', 'email'],
      }],
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    await item.update(req.body);
    const result = await Item.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['user_id', 'username', 'email'],
      }],
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};