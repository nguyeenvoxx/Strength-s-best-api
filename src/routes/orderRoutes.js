const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(orderController.createOrder)
  .get(orderController.getOrders);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;