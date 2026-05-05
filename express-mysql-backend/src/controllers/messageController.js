const { Message, User, Item, Conversation } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email'] },
        {
          model: Conversation,
          as: 'conversation',
          attributes: ['conversation_id', 'context_type', 'status', 'item_id', 'charity_id'],
        },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: messages });
  } catch (err) {
    next(err);
  }
};

exports.listBySender = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { sender_id: req.params.senderId },
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email'] },
        {
          model: Conversation,
          as: 'conversation',
          attributes: ['conversation_id', 'context_type', 'status', 'item_id', 'charity_id'],
        },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: messages });
  } catch (err) {
    next(err);
  }
};

exports.listByReceiver = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { receiver_id: req.params.receiverId },
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email'] },
        {
          model: Conversation,
          as: 'conversation',
          attributes: ['conversation_id', 'context_type', 'status', 'item_id', 'charity_id'],
        },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: messages });
  } catch (err) {
    next(err);
  }
};

exports.conversation = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.params.userId1, receiver_id: req.params.userId2 },
          { sender_id: req.params.userId2, receiver_id: req.params.userId1 },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email'] },
        {
          model: Conversation,
          as: 'conversation',
          attributes: ['conversation_id', 'context_type', 'status', 'item_id', 'charity_id'],
        },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'ASC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: messages });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id, {
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email'] },
        {
          model: Conversation,
          as: 'conversation',
          attributes: ['conversation_id', 'context_type', 'status', 'item_id', 'charity_id'],
        },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    if (!message) return res.status(404).json({ success: false, code: 404, message: 'Message not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: message });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const message = await Message.create(req.body);
    const result = await Message.findByPk(message.message_id, {
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email', 'device_token'] },
        {
          model: Conversation,
          as: 'conversation',
          attributes: ['conversation_id', 'context_type', 'status', 'item_id', 'charity_id', 'last_message_at'],
        },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    try {
      const { sendToUser } = require('../services/fcmService');
      if (result && result.receiver) {
        await sendToUser(result.receiver, { title: 'New Message', body: `${result.sender.username}: ${result.content}` }, { message_id: String(result.message_id), conversation_id: String(result.conversation ? result.conversation.conversation_id : '') });
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
    res.status(201).json({ success: true, code: 201, message: 'Created', data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ success: false, code: 404, message: 'Message not found', data: null });
    await message.update(req.body);
    const result = await Message.findByPk(req.params.id, {
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'username', 'email'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email'] },
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
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ success: false, code: 404, message: 'Message not found', data: null });
    await message.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};