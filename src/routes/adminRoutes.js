const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// Bảo vệ và giới hạn cho admin
router.use(authController.protect, authController.restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.route('/users/:id').patch(adminController.updateUser).delete(adminController.deleteUser);

module.exports = router;