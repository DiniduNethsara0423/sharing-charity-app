const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM charity ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM charity WHERE charity_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Charity not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, address, phone, email } = req.body;
    const [result] = await db.query(
      'INSERT INTO charity (name, description, address, phone, email) VALUES (?, ?, ?, ?, ?)',
      [name, description, address, phone, email]
    );
    const [rows] = await db.query('SELECT * FROM charity WHERE charity_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, address, phone, email } = req.body;
    await db.query(
      'UPDATE charity SET name = ?, description = ?, address = ?, phone = ?, email = ? WHERE charity_id = ?',
      [name, description, address, phone, email, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM charity WHERE charity_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Charity not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM charity WHERE charity_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Charity not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
