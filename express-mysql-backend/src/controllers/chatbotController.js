const { ChatbotQuery } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await ChatbotQuery.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.listByUser = async (req, res, next) => {
  try {
    const [rows] = await ChatbotQuery.findByUser(req.params.userId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await ChatbotQuery.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Query not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const [result] = await ChatbotQuery.create(req.body);
    const [rows] = await ChatbotQuery.findById(result.insertId);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [currentRows] = await ChatbotQuery.findById(req.params.id);
    if (!currentRows.length) return res.status(404).json({ error: 'Query not found' });
    await ChatbotQuery.update(req.params.id, req.body);
    const [rows] = await ChatbotQuery.findById(req.params.id);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await ChatbotQuery.remove(req.params.id);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Query not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};