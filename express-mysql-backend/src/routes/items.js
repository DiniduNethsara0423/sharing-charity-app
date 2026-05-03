const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/items');

router.get('/', itemsController.list);
router.get('/seller/:sellerId', itemsController.getBySeller);
router.post('/', itemsController.create);
router.get('/:id', itemsController.get);
router.put('/:id', itemsController.update);
router.delete('/:id', itemsController.remove);

module.exports = router;
