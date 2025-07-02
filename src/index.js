// Nhập các thư viện và tệp cần thiết
const express = require('express');
const connectDB = require('./config/db'); // Nhập connectDB từ db.js
const authRoutes = require('./routes/authRoutes');
const brandRoutes = require('./routes/brandRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const productReviewRoutes = require('./routes/productReviewRoutes');
const userRoutes = require('./routes/userRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./utils/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Middleware để xử lý JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký các route với tiền tố /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', productReviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/admin', adminRoutes);

// Middleware xử lý lỗi
app.use(errorHandler);

// Hàm ghi log các route đã đăng ký
const logRoutes = (router, prefix = '') => {
  if (router && router.stack) {
    router.stack.forEach(layer => {
      if (layer.route && layer.route.path && layer.route.methods) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        logger.info(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.handle && layer.handle.stack) {
        // Xử lý các router lồng nhau
        logRoutes(layer.handle, `${prefix}${layer.regexp.source.replace(/^\^\\\/|\\\//g, '/')}`);
      }
    });
  }
};

// Kết nối MongoDB và khởi động server
const port = 3000;
connectDB().then(() => {
  app.listen(port, () => {
    logger.info(`Server chạy trên cổng ${port} vào lúc ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    logger.info('Các route đã đăng ký:');
    logRoutes(app._router, '/api/v1');
  });
});