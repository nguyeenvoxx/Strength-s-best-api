const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(voucherController.createVoucher)
  .get(voucherController.getVouchers);
router.delete('/:id', voucherController.deleteVoucher);
router.patch('/:id', voucherController.updateVoucher);
router.patch('/:id/status', voucherController.setVoucherStatus);
router.patch('/:id/conditions', voucherController.updateVoucherConditions);

module.exports = router;