const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const JWT_SECRET = 'my-very-secure-jwt-secret-123';

// Tạo JWT token
const signToken = id => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '90d' });
};

// Đăng ký người dùng
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, phoneNumber, address } = req.body;
  
  if (!name || !email || !password) {
    return next(new AppError('Vui lòng cung cấp tên, email và mật khẩu', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    phoneNumber,
    address,
    role: 'user',
    status: 'active' // Tự động kích hoạt để thử nghiệm
  });

  const token = signToken(newUser._id);

  logger.info(`Người dùng mới đăng ký: ${email}`);
  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser }
  });
});

// Đăng nhập
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Vui lòng cung cấp email và mật khẩu', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email hoặc mật khẩu không đúng', 401));
  }

  const token = signToken(user._id);

  logger.info(`Người dùng đăng nhập: ${email}`);
  res.status(200).json({
    status: 'success',
    token,
    data: { user }
  });
});

// Middleware bảo vệ route
exports.protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Vui lòng cung cấp token', 401));
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('Người dùng không tồn tại', 401));
  }

  req.user = user;
  next();
});

// Giới hạn quyền truy cập
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
    }
    next();
  };
};