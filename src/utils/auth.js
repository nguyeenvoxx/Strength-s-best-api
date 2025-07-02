const jwt = require('jsonwebtoken');
const logger = require('./logger');

// Secret key hard-coded
const JWT_SECRET = 'my-very-secure-jwt-secret-123';

// Middleware xác thực token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Yêu cầu không có token');
    return res.status(401).json({ message: 'Vui lòng cung cấp token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Token không hợp lệ: ${err.message}`);
      return res.status(403).json({ message: 'Token hết hạn hoặc không hợp lệ' });
    }
    req.user = user;
    next();
  });
};

// Middleware giới hạn vai trò
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn(`Người dùng ${req.user.id} không có quyền: ${roles.join(', ')}`);
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
  };
};