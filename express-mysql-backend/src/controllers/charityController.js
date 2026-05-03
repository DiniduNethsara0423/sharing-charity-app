const { Charity } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const charities = await Charity.findAll({
      order: [['created_at', 'DESC']],
    });
    res.json(charities);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    res.json(charity);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json(charity);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    await charity.update(req.body);
    res.json(charity);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    await charity.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
