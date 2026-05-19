const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item ORDER BY created_at DESC');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { seller_id, title, description, category_id, size, price, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO item (seller_id, title, description, category_id, size, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [seller_id, title, description, category_id, size || null, price, status || 'active']
    );
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [result.insertId]);
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, category_id, size, price, status } = req.body;
    await db.query(
      'UPDATE item SET title = ?, description = ?, category_id = ?, size = ?, price = ?, status = ? WHERE item_id = ?',
      [title, description, category_id, size || null, price, status, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM item WHERE item_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};

exports.getBySeller = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};
