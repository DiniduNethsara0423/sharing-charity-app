const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE query_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Query not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { user_id, query, response, intent } = req.body;
    const [result] = await db.query(
      'INSERT INTO chatbot_query (user_id, query, response, intent) VALUES (?, ?, ?, ?)',
      [user_id, query, response, intent]
    );
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE query_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
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
    if (!rows.length) return res.status(404).json({ error: 'Query not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM chatbot_query WHERE query_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Query not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.getByUser = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
