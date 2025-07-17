const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Lấy thống kê dashboard
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const filterType = req.query.filterType || 'day';
  const date = req.query.date;

  // Tổng số người dùng
  const totalUsers = await User.countDocuments();
  // Tổng số đơn hàng
  const totalOrders = await require('../models/Order').countDocuments();
  // Tổng doanh thu
  const totalRevenueAgg = await require('../models/Order').aggregate([
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  // Revenue by time
  let groupId = null;
  let dateFormat = '';
  if (filterType === 'day') {
    groupId = { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } };
    dateFormat = '%Y-%m-%d';
  } else if (filterType === 'month') {
    groupId = { $dateToString: { format: '%Y-%m', date: '$created_at' } };
    dateFormat = '%Y-%m';
  } else if (filterType === 'year') {
    groupId = { $dateToString: { format: '%Y', date: '$created_at' } };
    dateFormat = '%Y';
  } else {
    groupId = { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } };
    dateFormat = '%Y-%m-%d';
  }

  const match = {};
  if (date && filterType === 'month') {
    match['$expr'] = {
      $eq: [
        { $dateToString: { format: '%Y-%m', date: '$created_at' } },
        date
      ]
    };
  } else if (date && filterType === 'year') {
    match['$expr'] = {
      $eq: [
        { $dateToString: { format: '%Y', date: '$created_at' } },
        date
      ]
    };
  } else if (date && filterType === 'day') {
    match['$expr'] = {
      $eq: [
        { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
        date
      ]
    };
  }

  const revenueByTime = await require('../models/Order').aggregate([
    Object.keys(match).length > 0 ? { $match: match } : { $match: {} },
    {
      $group: {
        _id: groupId,
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        label: '$_id',
        revenue: 1,
        _id: 0
      }
    }
  ]);

  res.status(200).json({
    status: 'thành công',
    data: {
      totalUsers,
      totalOrders,
      totalRevenue,
      revenueByTime
    }
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
    status: 'thành công',
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
    status: 'thành công',
    data: null
  });
});