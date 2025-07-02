const AppError = require('./appError');
const logger = require('./logger');

// Gửi lỗi trong môi trường phát triển
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack
  });
};

// Gửi lỗi trong môi trường sản xuất
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    logger.error('LỖI KHÔNG XÁC ĐỊNH: ', err);
    res.status(500).json({
      status: 'lỗi',
      message: 'Đã xảy ra lỗi, vui lòng thử lại sau!'
    });
  }
};

// Middleware xử lý lỗi
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'lỗi';

  // Mặc định dùng chế độ phát triển để dễ debug
  sendErrorDev(err, res);
};

module.exports = errorHandler;