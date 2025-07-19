const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticateToken, restrictTo } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Thiết lập nơi lưu trữ và tên file cho ảnh tin tức
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/news');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});
const upload = multer({ storage });

// Chỉ admin mới được tạo/sửa/xóa
router.post('/', authenticateToken, restrictTo('admin'), upload.single('image'), newsController.createNews);
router.patch('/:id', authenticateToken, restrictTo('admin'), upload.single('image'), newsController.updateNews);
router.delete('/:id', authenticateToken, restrictTo('admin'), newsController.deleteNews);

// Ai cũng xem được danh sách và chi tiết
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

module.exports = router;