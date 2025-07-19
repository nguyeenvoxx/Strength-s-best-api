const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Lấy hồ sơ người dùng
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(200).json({
    status: 'thành công',
    data: { user }
  });
});

// Cập nhật hồ sơ người dùng
exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const { name, phoneNumber, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phoneNumber, address, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  logger.info(`Cập nhật hồ sơ người dùng: ${req.user.email}`);
  res.status(200).json({
    status: 'thành công',
    data: { user }
  });
});

// Xóa tài khoản người dùng
exports.deleteUserAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);
  logger.info(`Xóa tài khoản người dùng: ${req.user.email}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});

// ADMIN ROUTES
// Lấy tất cả người dùng (có phân trang)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;
  const total = await User.countDocuments();
  const users = await User.find().skip(skip).limit(limit);
  res.status(200).json({
    status: 'thành công',
    results: total,
    data: { users }
  });
});