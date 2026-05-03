const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, phone, location FROM `user`');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, phone, location FROM `user` WHERE user_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { username, email, password_hash, phone, location } = req.body;
    const [result] = await db.query(
      'INSERT INTO `user` (username, email, password_hash, phone, location) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, phone, location]
    );
    const [rows] = await db.query('SELECT user_id, username, email, phone, location FROM `user` WHERE user_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { username, email, phone, location } = req.body;
    await db.query(
      'UPDATE `user` SET username = ?, email = ?, phone = ?, location = ? WHERE user_id = ?',
      [username, email, phone, location, req.params.id]
    );
    const [rows] = await db.query('SELECT user_id, username, email, phone, location FROM `user` WHERE user_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM `user` WHERE user_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
