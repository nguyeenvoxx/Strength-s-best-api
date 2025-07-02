const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(cartController.addToCart)
  .get(cartController.getCart)
  .delete(cartController.clearCart);

module.exports = router;