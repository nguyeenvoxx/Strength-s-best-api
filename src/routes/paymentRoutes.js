const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(paymentController.createPayment);
router.route('/:id')
  .get(paymentController.getPayment)
  .delete(paymentController.deletePayment);

module.exports = router;