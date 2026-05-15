const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query ORDER BY created_at DESC');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE query_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Query not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { user_id, query, response, intent } = req.body;
    const [result] = await db.query(
      'INSERT INTO chatbot_query (user_id, query, response, intent, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [user_id, query, response, intent]
    );
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE query_id = ?', [result.insertId]);
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { response, intent } = req.body;
    await db.query(
      'UPDATE chatbot_query SET response = ?, intent = ? WHERE query_id = ?',
      [response, intent, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE query_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Query not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM chatbot_query WHERE query_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'Query not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};

exports.getByUser = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};
