const express = require('express');
const router = express.Router();
const db = require('../db');

function getDonationReply(message) {
  const userMessage = message.toLowerCase();

  if (userMessage.includes('food') || userMessage.includes('meal') || userMessage.includes('rice')) {
    return {
      intent: 'food',
      reply: 'You can donate dry food, canned food, rice, dhal, milk powder, biscuits, and packed meals. Please make sure the food is not expired or spoiled.',
    };
  }

  if (userMessage.includes('cloth') || userMessage.includes('clothes') || userMessage.includes('dress')) {
    return {
      intent: 'clothes',
      reply: 'You can donate clean and usable clothes such as shirts, trousers, dresses, school uniforms, baby clothes, blankets, and bedsheets.',
    };
  }

  if (userMessage.includes('book') || userMessage.includes('school') || userMessage.includes('education')) {
    return {
      intent: 'education',
      reply: 'You can donate books, school bags, pens, pencils, exercise books, calculators, and other learning materials.',
    };
  }

  if (userMessage.includes('toy') || userMessage.includes('children') || userMessage.includes('kids')) {
    return {
      intent: 'toys',
      reply: 'You can donate clean and safe toys, story books, puzzles, and children’s learning items. Avoid broken or unsafe toys.',
    };
  }

  if (userMessage.includes('medicine') || userMessage.includes('medical')) {
    return {
      intent: 'medical',
      reply: 'Medical donations should be handled carefully. Avoid donating expired or opened medicine. It is better to donate medical items through verified organizations.',
    };
  }

  if (userMessage.includes('money') || userMessage.includes('cash') || userMessage.includes('fund')) {
    return {
      intent: 'money',
      reply: 'You can donate money to verified donation campaigns or trusted organizations. Always check the organization details before making a payment.',
    };
  }

  if (userMessage.includes('hygiene') || userMessage.includes('soap') || userMessage.includes('sanitary')) {
    return {
      intent: 'hygiene',
      reply: 'You can donate hygiene products such as soap, toothpaste, toothbrushes, sanitary items, shampoo, and handwash. Please donate only unused and sealed items.',
    };
  }

  if (userMessage.includes('not suitable') || userMessage.includes('avoid') || userMessage.includes('cannot donate')) {
    return {
      intent: 'restriction',
      reply: 'Avoid donating expired food, damaged clothes, broken toys, opened medicine, used personal hygiene items, and unsafe electrical items.',
    };
  }

  if (userMessage.includes('what') || userMessage.includes('suitable') || userMessage.includes('donate')) {
    return {
      intent: 'general',
      reply: 'Suitable donation items include food, clothes, books, school supplies, toys, hygiene products, blankets, and money. Please make sure donated items are clean, safe, and usable.',
    };
  }

  return {
    intent: 'general',
    reply: 'I can help you with donation-related questions. You can ask about food donations, clothes, books, toys, hygiene products, money donations, or unsuitable donation items.',
  };
}

async function insertChat({ userId, message, reply, intent }) {
  const [result] = await db.query(
    'INSERT INTO chatbot_query (user_id, `query`, `response`, `intent`, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [userId, message, reply, intent]
  );

  const [rows] = await db.query('SELECT * FROM chatbot_query WHERE query_id = ?', [result.insertId]);
  return rows[0] || null;
}

router.post('/donation', async (req, res, next) => {
  try {
    const { message } = req.body || {};
    const userId = req.body.user_id || req.body.userId || req.user?.user_id || req.user?.id || null;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, code: 400, message: 'Please enter a donation-related question.', data: null });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'user_id is required to save chatbot chats.',
        data: null,
      });
    }

    const { reply, intent } = getDonationReply(message);
    const savedChat = await insertChat({ userId, message, reply, intent });

    return res.status(200).json({
      success: true,
      code: 200,
      message: 'OK',
      data: {
        reply,
        chat: savedChat,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query ORDER BY created_at DESC');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/history/:userId', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_query WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/status', (req, res) => {
  const endpoints = [
    { path: '/donation', method: 'POST', description: 'Get donation guidance and save the chat', status: 'available' },
    { path: '/history', method: 'GET', description: 'Get all saved chatbot chats', status: 'available' },
    { path: '/history/:userId', method: 'GET', description: 'Get saved chatbot chats for one user', status: 'available' },
    { path: '/status', method: 'GET', description: 'Chatbot status and available endpoints', status: 'available' },
  ];

  return res.status(200).json({ success: true, code: 200, message: 'OK', data: { status: 'ready', endpoints } });
});

module.exports = router;
