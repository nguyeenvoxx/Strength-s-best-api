const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(orderController.createOrder)
  .get(orderController.getOrders);
router.get('/:id/detail', orderController.getOrderDetail);
router.delete('/:id', orderController.deleteOrder);
router.get('/notifications', orderController.getNotifications);
router.get('/search', orderController.search);

module.exports = router;