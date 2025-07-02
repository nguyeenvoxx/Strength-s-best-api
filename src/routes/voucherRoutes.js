const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(voucherController.createVoucher)
  .get(voucherController.getVouchers);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;