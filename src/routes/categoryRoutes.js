const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(categoryController.createCategory)
  .get(categoryController.getCategories);
router.route('/:id')
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);
  

module.exports = router;