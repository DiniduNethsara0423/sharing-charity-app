const { Transaction, User, Item } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.listByBuyer = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { buyer_id: req.params.buyerId },
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.listBySeller = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { seller_id: req.params.sellerId },
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
    });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const transaction = await Transaction.create(req.body);
    const result = await Transaction.findByPk(transaction.transaction_id, {
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    await transaction.update(req.body);
    const result = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    await transaction.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};