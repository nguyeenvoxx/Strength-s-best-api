const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(productController.createProduct)
  .get(productController.getProducts);
router.route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;