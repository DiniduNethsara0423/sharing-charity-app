const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM donation ORDER BY created_at DESC');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM donation WHERE donation_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { donor_id, charity_id, item_id, status, gift_location, impact } = req.body;
    const [result] = await db.query(
      'INSERT INTO donation (donor_id, charity_id, item_id, status, gift_location, impact) VALUES (?, ?, ?, ?, ?, ?)',
      [donor_id, charity_id, item_id, status || 'pending', gift_location, impact]
    );
    const [rows] = await db.query('SELECT * FROM donation WHERE donation_id = ?', [result.insertId]);
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status, gift_location, impact } = req.body;
    await db.query(
      'UPDATE donation SET status = ?, gift_location = ?, impact = ? WHERE donation_id = ?',
      [status, gift_location, impact, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM donation WHERE donation_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM donation WHERE donation_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};

exports.getByDonor = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM donation WHERE donor_id = ? ORDER BY created_at DESC', [req.params.donorId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.getByCharity = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM donation WHERE charity_id = ? ORDER BY created_at DESC', [req.params.charityId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};
