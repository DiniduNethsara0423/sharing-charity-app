const { ChatbotQuery } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await ChatbotQuery.findAll();
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.listByUser = async (req, res, next) => {
  try {
    const [rows] = await ChatbotQuery.findByUser(req.params.userId);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await ChatbotQuery.findById(req.params.id);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Query not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const [result] = await ChatbotQuery.create(req.body);
    const [rows] = await ChatbotQuery.findById(result.insertId);
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [currentRows] = await ChatbotQuery.findById(req.params.id);
    if (!currentRows.length) return res.status(404).json({ success: false, code: 404, message: 'Query not found', data: null });
    await ChatbotQuery.update(req.params.id, req.body);
    const [rows] = await ChatbotQuery.findById(req.params.id);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await ChatbotQuery.remove(req.params.id);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'Query not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};