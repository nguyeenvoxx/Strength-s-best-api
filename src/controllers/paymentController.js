const Payment = require('../models/payment');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo thanh toán
exports.createPayment = catchAsync(async (req, res, next) => {
  const { orderId, amount, method } = req.body;

  if (!orderId || !amount || !method) {
    return next(new AppError('Thiếu các trường bắt buộc: orderId, amount, method', 400));
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng', 404));
  }

  const payment = await Payment.create({
    orderId,
    amount,
    method,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  logger.info(`Tạo thanh toán cho đơn hàng ${orderId}`);
  res.status(201).json({
    status: 'thành công',
    data: { payment }
  });
});

// Lấy thông tin thanh toán
exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('orderId');
  if (!payment) {
    return next(new AppError('Không tìm thấy thanh toán', 404));
  }

  res.status(200).json({
    status: 'thành công',
    data: { payment }
  });
});

// Xóa thanh toán
exports.deletePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) {
    return next(new AppError('Không tìm thấy thanh toán', 404));
  }

  logger.info(`Xóa thanh toán ${req.params.id}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});