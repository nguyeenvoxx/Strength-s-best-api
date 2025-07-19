// Nhập các thư viện và tệp cần thiết

const express = require('express');
const connectDB = require('./src/config/db'); // Nhập connectDB từ db.js
const authRoutes = require('./src/routes/authRoutes');
const brandRoutes = require('./src/routes/brandRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const productRoutes = require('./src/routes/productRoutes');
const productReviewRoutes = require('./src/routes/productReviewRoutes');
const userRoutes = require('./src/routes/userRoutes');
const voucherRoutes = require('./src/routes/voucherRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const errorHandler = require('./src/utils/errorHandler');
const logger = require('./src/utils/logger');
const cors = require('cors');
const newsRoutes = require('./src/routes/newsRoutes');
// require('dotenv').config();
// mongoose.connect(process.env.MONGO_URI);
const app = express();

// Middleware để xử lý JSON và URL-encoded
app.use(express.json());
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  credentials: true
}));

// Đăng ký các route với tiền tố /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/product-reviews', productReviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/v1/news', newsRoutes);
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
const port = process.env.port || 3000;
connectDB().then(() => {
  app.listen(port, () => {
    logger.info(`Server chạy trên cổng ${port} vào lúc ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    logger.info('Các route đã đăng ký:');
    logRoutes(app._router, '/api/v1');
  });
});