const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { singleMemory } = require('../services/uploadService');

router.get('/', categoryController.list);
router.get('/:id', categoryController.get);
router.post('/', singleMemory('image'), categoryController.create);
router.put('/:id', singleMemory('image'), categoryController.update);
router.delete('/:id', categoryController.remove);

module.exports = router;
