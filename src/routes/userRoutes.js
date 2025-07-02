const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .get(userController.getUserProfile)
  .patch(userController.updateUserProfile)
  .delete(userController.deleteUserAccount);

module.exports = router;