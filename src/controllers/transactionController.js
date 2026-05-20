const { Transaction, User, Item } = require('../models');

async function markItemSold(itemId) {
  if (!itemId) {
    return;
  }

  const item = await Item.findByPk(itemId);
  if (item && item.status !== 'sold') {
    await item.update({ status: 'sold' });
  }
}

exports.list = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: transactions });
  } catch (err) {
    next(err);
  }
};

exports.listByBuyer = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { buyer_id: req.params.buyerId },
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: transactions });
  } catch (err) {
    next(err);
  }
};

exports.listBySeller = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { seller_id: req.params.sellerId },
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: transactions });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
    });
    if (!transaction) return res.status(404).json({ success: false, code: 404, message: 'Transaction not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: transaction });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const transaction = await Transaction.create(req.body);
    if (transaction.status === 'completed') {
      await markItemSold(transaction.item_id);
    }
    const result = await Transaction.findByPk(transaction.transaction_id, {
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
    });
    try {
      const { sendToUser } = require('../services/fcmService');
      if (result && result.status === 'completed') {
        if (result.buyer) {
          await sendToUser(
            result.buyer,
            { title: 'Purchase Successful', body: `Your purchase for "${result.item ? result.item.title : 'an item'}" was completed successfully.` },
            { type: 'transaction_completed', transaction_id: String(result.transaction_id), role: 'buyer' }
          );
        }
        if (result.seller) {
          await sendToUser(
            result.seller,
            { title: 'Item Sold', body: `Your item "${result.item ? result.item.title : 'an item'}" was sold successfully.` },
            { type: 'transaction_completed', transaction_id: String(result.transaction_id), role: 'seller' }
          );
        }
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
    res.status(201).json({ success: true, code: 201, message: 'Created', data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, code: 404, message: 'Transaction not found', data: null });
    const previousStatus = transaction.status;
    await transaction.update(req.body);
    if (transaction.status === 'completed' || req.body.status === 'completed') {
      await markItemSold(transaction.item_id);
    }
    const result = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: User, as: 'seller', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title', 'price'] },
      ],
    });
    try {
      const { sendToUser } = require('../services/fcmService');
      if (result && result.status === 'completed' && previousStatus !== 'completed') {
        if (result.buyer) {
          await sendToUser(
            result.buyer,
            { title: 'Purchase Successful', body: `Your purchase for "${result.item ? result.item.title : 'an item'}" was completed successfully.` },
            { type: 'transaction_completed', transaction_id: String(result.transaction_id), role: 'buyer' }
          );
        }
        if (result.seller) {
          await sendToUser(
            result.seller,
            { title: 'Item Sold', body: `Your item "${result.item ? result.item.title : 'an item'}" was sold successfully.` },
            { type: 'transaction_completed', transaction_id: String(result.transaction_id), role: 'seller' }
          );
        }
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
    res.status(200).json({ success: true, code: 200, message: 'OK', data: result });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, code: 404, message: 'Transaction not found', data: null });
    await transaction.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};