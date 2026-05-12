const { User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
    });
    const rows = users.map(u => u.toJSON());
    // Keep image field as stored (data URL or existing path). Frontend can use data URL directly.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
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
    const response = user.toJSON();
    // Return stored image value (data URL or path) directly without saving files.
    res.status(200).json({ success: true, code: 200, message: 'OK', data: response });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      payload.image = `data:${req.file.mimetype};base64,${b64}`;
    }
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
    if (req.file && req.file.buffer) {
      const b64 = req.file.buffer.toString('base64');
      payload.image = `data:${req.file.mimetype};base64,${b64}`;
    }
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
