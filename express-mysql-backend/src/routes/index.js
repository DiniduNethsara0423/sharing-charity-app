const express = require('express');
const userController = require('../controllers/userController');
const itemController = require('../controllers/itemController');
const transactionController = require('../controllers/transactionController');
const donationController = require('../controllers/donationController');
const chatbotController = require('../controllers/chatbotController');
const messageController = require('../controllers/messageController');
const charityController = require('../controllers/charityController');

const router = express.Router();

router.get('/', (req, res) => res.json({ ok: true }));

router.get('/users', userController.list);
router.get('/users/:id', userController.get);
router.post('/users', userController.create);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.remove);

router.get('/items', itemController.list);
router.get('/items/seller/:sellerId', itemController.listBySeller);
router.get('/items/:id', itemController.get);
router.post('/items', itemController.create);
router.put('/items/:id', itemController.update);
router.delete('/items/:id', itemController.remove);

router.get('/transactions', transactionController.list);
router.get('/transactions/buyer/:buyerId', transactionController.listByBuyer);
router.get('/transactions/seller/:sellerId', transactionController.listBySeller);
router.get('/transactions/:id', transactionController.get);
router.post('/transactions', transactionController.create);
router.put('/transactions/:id', transactionController.update);
router.delete('/transactions/:id', transactionController.remove);

router.get('/donations', donationController.list);
router.get('/donations/donor/:donorId', donationController.listByDonor);
router.get('/donations/charity/:charityId', donationController.listByCharity);
router.get('/donations/:id', donationController.get);
router.post('/donations', donationController.create);
router.put('/donations/:id', donationController.update);
router.delete('/donations/:id', donationController.remove);

router.get('/chatbot-queries', chatbotController.list);
router.get('/chatbot-queries/user/:userId', chatbotController.listByUser);
router.get('/chatbot-queries/:id', chatbotController.get);
router.post('/chatbot-queries', chatbotController.create);
router.put('/chatbot-queries/:id', chatbotController.update);
router.delete('/chatbot-queries/:id', chatbotController.remove);

router.get('/messages', messageController.list);
router.get('/messages/sender/:senderId', messageController.listBySender);
router.get('/messages/receiver/:receiverId', messageController.listByReceiver);
router.get('/messages/conversation/:userId1/:userId2', messageController.conversation);
router.get('/messages/:id', messageController.get);
router.post('/messages', messageController.create);
router.put('/messages/:id', messageController.update);
router.delete('/messages/:id', messageController.remove);

router.get('/charities', charityController.list);
router.get('/charities/:id', charityController.get);
router.post('/charities', charityController.create);
router.put('/charities/:id', charityController.update);
router.delete('/charities/:id', charityController.remove);

module.exports = router;
