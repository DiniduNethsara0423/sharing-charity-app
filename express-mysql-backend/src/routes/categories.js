const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { single } = require('../services/uploadService');

router.get('/', categoryController.list);
router.get('/:id', categoryController.get);
router.post('/', single('image', 'categories'), categoryController.create);
router.put('/:id', single('image', 'categories'), categoryController.update);
router.delete('/:id', categoryController.remove);

module.exports = router;
