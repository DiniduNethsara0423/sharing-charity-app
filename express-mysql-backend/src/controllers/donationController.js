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
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donations });
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
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donations });
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
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donations });
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
    if (!donation) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donation });
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
    res.status(201).json({ success: true, code: 201, message: 'Created', data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    await donation.update(req.body);
    const result = await Donation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: result });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    await donation.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};