const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/')
  .post(favoriteController.addToFavorites)
  .get(favoriteController.getFavorites);
router.delete('/:id', favoriteController.removeFromFavorites);

module.exports = router;