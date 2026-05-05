const { Charity } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const charities = await Charity.findAll({
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: charities });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ success: false, code: 404, message: 'Charity not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: charity });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, code: 201, message: 'Created', data: charity });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ success: false, code: 404, message: 'Charity not found', data: null });
    await charity.update(req.body);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: charity });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ success: false, code: 404, message: 'Charity not found', data: null });
    await charity.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};
