const express = require('express');
const router = express.Router();

router.post('/donation', (req, res) => {
  const { message } = req.body || {};

  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, code: 400, message: 'Please enter a donation-related question.', data: null });
  }

  const userMessage = message.toLowerCase();
  let reply = '';

  if (
    userMessage.includes('food') ||
    userMessage.includes('meal') ||
    userMessage.includes('rice')
  ) {
    reply =
      'You can donate dry food, canned food, rice, dhal, milk powder, biscuits, and packed meals. Please make sure the food is not expired or spoiled.';
  } else if (
    userMessage.includes('cloth') ||
    userMessage.includes('clothes') ||
    userMessage.includes('dress')
  ) {
    reply =
      'You can donate clean and usable clothes such as shirts, trousers, dresses, school uniforms, baby clothes, blankets, and bedsheets.';
  } else if (
    userMessage.includes('book') ||
    userMessage.includes('school') ||
    userMessage.includes('education')
  ) {
    reply =
      'You can donate books, school bags, pens, pencils, exercise books, calculators, and other learning materials.';
  } else if (
    userMessage.includes('toy') ||
    userMessage.includes('children') ||
    userMessage.includes('kids')
  ) {
    reply =
      'You can donate clean and safe toys, story books, puzzles, and children’s learning items. Avoid broken or unsafe toys.';
  } else if (
    userMessage.includes('medicine') ||
    userMessage.includes('medical')
  ) {
    reply =
      'Medical donations should be handled carefully. Avoid donating expired or opened medicine. It is better to donate medical items through verified organizations.';
  } else if (
    userMessage.includes('money') ||
    userMessage.includes('cash') ||
    userMessage.includes('fund')
  ) {
    reply =
      'You can donate money to verified donation campaigns or trusted organizations. Always check the organization details before making a payment.';
  } else if (
    userMessage.includes('hygiene') ||
    userMessage.includes('soap') ||
    userMessage.includes('sanitary')
  ) {
    reply =
      'You can donate hygiene products such as soap, toothpaste, toothbrushes, sanitary items, shampoo, and handwash. Please donate only unused and sealed items.';
  } else if (
    userMessage.includes('not suitable') ||
    userMessage.includes('avoid') ||
    userMessage.includes('cannot donate')
  ) {
    reply =
      'Avoid donating expired food, damaged clothes, broken toys, opened medicine, used personal hygiene items, and unsafe electrical items.';
  } else if (
    userMessage.includes('what') ||
    userMessage.includes('suitable') ||
    userMessage.includes('donate')
  ) {
    reply =
      'Suitable donation items include food, clothes, books, school supplies, toys, hygiene products, blankets, and money. Please make sure donated items are clean, safe, and usable.';
  } else {
    reply =
      'I can help you with donation-related questions. You can ask about food donations, clothes, books, toys, hygiene products, money donations, or unsuitable donation items.';
  }

  return res.status(200).json({ success: true, code: 200, message: 'OK', data: { reply } });
});

// Status endpoint: returns chatbot availability and available endpoints
router.get('/status', (req, res) => {
  const endpoints = [
    { path: '/donation', method: 'POST', description: 'Get donation guidance based on user message', status: 'available' },
    { path: '/status', method: 'GET', description: 'Chatbot status and available endpoints', status: 'available' },
  ];

  return res.status(200).json({ success: true, code: 200, message: 'OK', data: { status: 'ready', endpoints } });
});

module.exports = router;
