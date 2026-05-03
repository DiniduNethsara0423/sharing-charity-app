const express = require('express');
const router = express.Router();
const charitiesController = require('../controllers/charities');

router.get('/', charitiesController.list);
router.get('/:id', charitiesController.get);
router.post('/', charitiesController.create);
router.put('/:id', charitiesController.update);
router.delete('/:id', charitiesController.remove);

module.exports = router;
