const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, phone, location FROM `user`');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, phone, location FROM `user` WHERE user_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'User not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
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
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
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
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'User not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM `user` WHERE user_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'User not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};
