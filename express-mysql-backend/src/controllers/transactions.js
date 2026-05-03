const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE transaction_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { buyer_id, seller_id, item_id, amount, type, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO `transaction` (buyer_id, seller_id, item_id, amount, type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [buyer_id, seller_id, item_id, amount, type, status || 'pending']
    );
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE transaction_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status, type, amount } = req.body;
    await db.query(
      'UPDATE `transaction` SET status = ?, type = ?, amount = ? WHERE transaction_id = ?',
      [status, type, amount, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE transaction_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM `transaction` WHERE transaction_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.getByBuyer = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE buyer_id = ? ORDER BY created_at DESC', [req.params.buyerId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getBySeller = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
