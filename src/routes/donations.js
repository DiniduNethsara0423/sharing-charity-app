const express = require('express');
const router = express.Router();
const donationsController = require('../controllers/donations');

router.get('/', donationsController.list);
router.get('/donor/:donorId', donationsController.getByDonor);
router.get('/charity/:charityId', donationsController.getByCharity);
router.post('/', donationsController.create);
router.get('/:id', donationsController.get);
router.put('/:id', donationsController.update);
router.delete('/:id', donationsController.remove);

module.exports = router;
