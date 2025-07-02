const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Lấy thống kê dashboard
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const userCount = await User.countDocuments();
  const productCount = await Product.countDocuments();

  res.status(200).json({
    status: 'success',
    data: { userCount, productCount }
  });
});

// Cập nhật thông tin người dùng
exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phoneNumber, address, role, status } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, phoneNumber, address, role, status, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  logger.info(`Cập nhật người dùng: ${user.email}`);
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Xóa người dùng
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng', 404));
  }

  logger.info(`Xóa người dùng: ${user.email}`);
  res.status(204).json({
    status: 'success',
    data: null
  });
});