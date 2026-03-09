const express = require('express');
const router = express.Router();
const shopsController = require('../controllers/shopsController');
const { requireAuth } = require('../middleware/auth');

router.get('/nearby', requireAuth, shopsController.getNearbyShops);
router.get('/:id', requireAuth, shopsController.getShopById);

module.exports = router;

