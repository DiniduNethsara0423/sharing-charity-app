const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { seller_id, title, description, category, price, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO item (seller_id, title, description, category, price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [seller_id, title, description, category, price, status || 'active']
    );
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, category, price, status } = req.body;
    await db.query(
      'UPDATE item SET title = ?, description = ?, category = ?, price = ?, status = ? WHERE item_id = ?',
      [title, description, category, price, status, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM item WHERE item_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.getBySeller = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
