const express = require('express');
const router = express.Router();
const productReviewController = require('../controllers/productReviewController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(productReviewController.createReview)
  .get(productReviewController.getReviews);
router.delete('/:id', productReviewController.deleteReview);
router.post('/:id/admin-replies', productReviewController.addAdminReply);
router.patch('/:id/admin-replies', productReviewController.editAdminReply);
router.delete('/:id/admin-replies', productReviewController.deleteAdminReply);

module.exports = router;