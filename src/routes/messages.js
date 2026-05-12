const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages');

router.get('/', messagesController.list);
router.get('/sender/:senderId', messagesController.getBySender);
router.get('/receiver/:receiverId', messagesController.getByReceiver);
router.get('/conversation/:userId1/:userId2', messagesController.getConversation);
router.post('/', messagesController.create);
router.get('/:id', messagesController.get);
router.put('/:id', messagesController.update);
router.delete('/:id', messagesController.remove);

module.exports = router;
