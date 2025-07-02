const Voucher = require('../models/voucher');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo phiếu giảm giá
exports.createVoucher = catchAsync(async (req, res, next) => {
  const { code, discount, description } = req.body;

  if (!code || !discount || !description) {
    return next(new AppError('Thiếu các trường bắt buộc: code, discount, description', 400));
  }

  if (discount < 0 || discount > 100) {
    return next(new AppError('Giảm giá phải nằm trong khoảng 0-100', 400));
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const voucher = await Voucher.create({
    code,
    count: 100, // Mặc định 100 lần sử dụng
    discount,
    expiryDate,
    description,
    created_at: Date.now(),
    updated_at: Date.now()
  });

  logger.info(`Tạo phiếu giảm giá: ${code}`);
  res.status(201).json({
    status: 'thành công',
    data: { voucher }
  });
});

// Lấy tất cả phiếu giảm giá
exports.getVouchers = catchAsync(async (req, res, next) => {
  const vouchers = await Voucher.find();
  res.status(200).json({
    status: 'thành công',
    results: vouchers.length,
    data: { vouchers }
  });
});

// Xóa phiếu giảm giá
exports.deleteVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findByIdAndDelete(req.params.id);
  if (!voucher) {
    return next(new AppError('Không tìm thấy phiếu giảm giá', 404));
  }

  logger.info(`Xóa phiếu giảm giá: ${voucher.code}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});