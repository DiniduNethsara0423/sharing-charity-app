const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', notificationController.list);
router.get('/user/:userId', notificationController.listByUser);
router.get('/:id', notificationController.get);
router.post('/', notificationController.create);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;