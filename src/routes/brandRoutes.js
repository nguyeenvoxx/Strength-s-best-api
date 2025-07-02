const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(brandController.createBrand)
  .get(brandController.getBrands);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;