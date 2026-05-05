const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM message ORDER BY created_at DESC');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM message WHERE message_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Message not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { sender_id, receiver_id, item_id, content, encrypted } = req.body;
    const [result] = await db.query(
      'INSERT INTO message (sender_id, receiver_id, item_id, content, encrypted) VALUES (?, ?, ?, ?, ?)',
      [sender_id, receiver_id, item_id, content, encrypted || false]
    );
    const [rows] = await db.query('SELECT * FROM message WHERE message_id = ?', [result.insertId]);
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { content, encrypted } = req.body;
    await db.query(
      'UPDATE message SET content = ?, encrypted = ? WHERE message_id = ?',
      [content, encrypted, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM message WHERE message_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Message not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM message WHERE message_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'Message not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};

exports.getBySender = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM message WHERE sender_id = ? ORDER BY created_at DESC', [req.params.senderId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.getByReceiver = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM message WHERE receiver_id = ? ORDER BY created_at DESC', [req.params.receiverId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { userId1, userId2 } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM message WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC',
      [userId1, userId2, userId2, userId1]
    );
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};
