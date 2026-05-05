const { User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: users });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ success: false, code: 404, message: 'User not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: user });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file) payload.image = `/uploads/users/${req.file.filename}`;
    const user = await User.create(payload);
    const response = user.toJSON();
    delete response.password_hash;
    res.status(201).json({ success: true, code: 201, message: 'Created', data: response });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, code: 404, message: 'User not found', data: null });

    const payload = { ...req.body };
    if (req.file) payload.image = `/uploads/users/${req.file.filename}`;
    await user.update(payload);
    const response = user.toJSON();
    delete response.password_hash;
    res.status(200).json({ success: true, code: 200, message: 'OK', data: response });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, code: 404, message: 'User not found', data: null });

    await user.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};
