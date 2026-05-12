const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Message, Conversation, User, Item } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const verifySocketToken = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  return jwt.verify(token, JWT_SECRET);
};

const findConversation = async ({ conversationId, senderId, receiverId, itemId, charityId, contextType }) => {
  if (conversationId) {
    const existingConversation = await Conversation.findByPk(conversationId);
    if (existingConversation) {
      return existingConversation;
    }
  }

  const existingConversation = await Conversation.findOne({
    where: {
      [Op.or]: [
        {
          participant_one_id: senderId,
          participant_two_id: receiverId,
        },
        {
          participant_one_id: receiverId,
          participant_two_id: senderId,
        },
      ],
      item_id: itemId || null,
      charity_id: charityId || null,
      context_type: contextType || 'sale',
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  return Conversation.create({
    participant_one_id: senderId,
    participant_two_id: receiverId,
    item_id: itemId || null,
    charity_id: charityId || null,
    context_type: contextType || 'sale',
    status: 'active',
    last_message_at: new Date(),
  });
};

const emitConversationState = async (io, conversation, message) => {
  const payload = await Message.findByPk(message.message_id, {
    include: [
      { model: User, as: 'sender', attributes: ['user_id', 'username', 'email'] },
      { model: User, as: 'receiver', attributes: ['user_id', 'username', 'email'] },
      {
        model: Conversation,
        as: 'conversation',
        attributes: ['conversation_id', 'context_type', 'status', 'item_id', 'charity_id', 'last_message_at'],
      },
      { model: Item, as: 'item', attributes: ['item_id', 'title'] },
    ],
  });

  io.to(`conversation:${conversation.conversation_id}`).emit('message:created', payload);
  io.to(`conversation:${conversation.conversation_id}`).emit('conversation:updated', conversation);
};

const initializeSocket = (httpServer) => {
  const { Server } = require('socket.io');
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
      const decoded = verifySocketToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.emit('socket:ready', { userId: socket.userId });

    socket.on('conversation:join', async ({ conversationId }) => {
      if (!conversationId) {
        socket.emit('socket:error', { message: 'conversationId is required' });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      socket.emit('conversation:joined', { conversationId });
    });

    socket.on('message:send', async (payload, ack) => {
      try {
        const {
          conversationId,
          receiverId,
          itemId,
          charityId,
          contextType,
          content,
          encrypted = false,
        } = payload || {};

        if (!receiverId || !content) {
          throw new Error('receiverId and content are required');
        }

        const conversation = await findConversation({
          conversationId,
          senderId: socket.userId,
          receiverId,
          itemId,
          charityId,
          contextType,
        });

        const message = await Message.create({
          sender_id: socket.userId,
          receiver_id: receiverId,
          conversation_id: conversation.conversation_id,
          item_id: itemId || null,
          content,
          encrypted,
        });

        await conversation.update({
          last_message_at: new Date(),
        });

        socket.join(`conversation:${conversation.conversation_id}`);

        await emitConversationState(io, conversation, message);

        if (typeof ack === 'function') {
          ack({ ok: true, conversationId: conversation.conversation_id, messageId: message.message_id });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, error: error.message });
        }
        socket.emit('socket:error', { message: error.message });
      }
    });
  });

  return io;
};

module.exports = { initializeSocket };