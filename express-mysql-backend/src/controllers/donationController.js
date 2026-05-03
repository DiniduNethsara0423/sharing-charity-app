const { Donation, User, Charity, Item } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const donations = await Donation.findAll({
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(donations);
  } catch (err) {
    next(err);
  }
};

exports.listByDonor = async (req, res, next) => {
  try {
    const donations = await Donation.findAll({
      where: { donor_id: req.params.donorId },
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(donations);
  } catch (err) {
    next(err);
  }
};

exports.listByCharity = async (req, res, next) => {
  try {
    const donations = await Donation.findAll({
      where: { charity_id: req.params.charityId },
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(donations);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const donation = await Donation.create(req.body);
    const result = await Donation.findByPk(donation.donation_id, {
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    await donation.update(req.body);
    const result = await Donation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    await donation.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};