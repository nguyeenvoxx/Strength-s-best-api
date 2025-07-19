const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Thiết lập nơi lưu trữ và tên file cho ảnh sản phẩm
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/products');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});
const upload = multer({ storage });

router.use(authController.protect);

router.route('/')
  .post(upload.single('image'), productController.createProduct)
  .get(productController.getProducts);
router.route('/:id')
  .get(productController.getProduct)
  .patch(upload.single('image'), productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;