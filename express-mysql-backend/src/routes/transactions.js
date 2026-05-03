const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions');

router.get('/', transactionsController.list);
router.get('/buyer/:buyerId', transactionsController.getByBuyer);
router.get('/seller/:sellerId', transactionsController.getBySeller);
router.post('/', transactionsController.create);
router.get('/:id', transactionsController.get);
router.put('/:id', transactionsController.update);
router.delete('/:id', transactionsController.remove);

module.exports = router;
