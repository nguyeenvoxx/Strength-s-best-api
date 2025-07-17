const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Route chỉ cho admin
router.get('/', authController.protect, authController.restrictTo('admin'), userController.getAllUsers);

router.use(authController.protect);

router.route('/profile') // Đổi thành /profile để rõ ràng hơn
  .get(userController.getUserProfile)
  .patch(userController.updateUserProfile)
  .delete(userController.deleteUserAccount);

module.exports = router;