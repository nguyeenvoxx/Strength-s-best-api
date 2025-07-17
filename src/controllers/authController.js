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
    status: 'thành công',
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
  if (!user) {
    return next(new AppError('Email không tồn tại', 401));
  }

  if (user.status !== 'active') {
    return next(new AppError('Tài khoản của bạn không hoạt động. Vui lòng liên hệ hỗ trợ.', 403));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Mật khẩu không đúng', 401));
  }

  const token = signToken(user._id);

  logger.info(`Người dùng đăng nhập: ${email}`);
  res.status(200).json({
    status: 'thành công',
    token,
    data: { user }
  });
});

// Đăng xuất
exports.logout = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Vui lòng cung cấp token', 401));
  }

  // Xác minh token để đảm bảo hợp lệ
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('Người dùng không tồn tại', 401));
    }

    logger.info(`Người dùng đăng xuất: ${user.email}`);
    res.status(200).json({
      status: 'thành công',
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    return next(new AppError('Token không hợp lệ', 401));
  }
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