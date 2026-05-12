const express = require('express');
const router = express.Router();
const chatbotQueriesController = require('../controllers/chatbotQueries');

router.get('/', chatbotQueriesController.list);
router.get('/user/:userId', chatbotQueriesController.getByUser);
router.post('/', chatbotQueriesController.create);
router.get('/:id', chatbotQueriesController.get);
router.put('/:id', chatbotQueriesController.update);
router.delete('/:id', chatbotQueriesController.remove);

module.exports = router;
