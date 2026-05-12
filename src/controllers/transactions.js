const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` ORDER BY created_at DESC');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE transaction_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Transaction not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
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
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
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
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Transaction not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM `transaction` WHERE transaction_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'Transaction not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};

exports.getByBuyer = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE buyer_id = ? ORDER BY created_at DESC', [req.params.buyerId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.getBySeller = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM `transaction` WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};
