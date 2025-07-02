const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

// Hàm kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri, config.db.options);
    logger.info('Kết nối MongoDB thành công!');
  } catch (err) {
    logger.error(`Lỗi kết nối MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;