const { Notification, User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      include: [{ model: User, as: 'user', attributes: ['user_id', 'username', 'email'] }],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: notifications });
  } catch (err) {
    next(err);
  }
};

exports.listByUser = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.params.userId },
      include: [{ model: User, as: 'user', attributes: ['user_id', 'username', 'email'] }],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: notifications });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['user_id', 'username', 'email'] }],
    });
    if (!notification) {
      return res.status(404).json({ success: false, code: 404, message: 'Notification not found', data: null });
    }
    res.status(200).json({ success: true, code: 200, message: 'OK', data: notification });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    const result = await Notification.findByPk(notification.notification_id, {
      include: [{ model: User, as: 'user', attributes: ['user_id', 'username', 'email'] }],
    });
    res.status(201).json({ success: true, code: 201, message: 'Created', data: result });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, code: 404, message: 'Notification not found', data: null });
    }
    await notification.update({ is_read: true });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: notification });
  } catch (err) {
    next(err);
  }
};