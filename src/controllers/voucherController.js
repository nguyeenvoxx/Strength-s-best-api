const Voucher = require('../models/voucher');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { notifications } = require('./orderController');

// Tạo phiếu giảm giá
exports.createVoucher = catchAsync(async (req, res, next) => {
  const { code, discount, description, count } = req.body;

  if (!code || !discount || !description) {
    return next(new AppError('Thiếu các trường bắt buộc: code, discount, description', 400));
  }

  if (discount < 0 || discount > 100) {
    return next(new AppError('Giảm giá phải nằm trong khoảng 0-100', 400));
  }

  if (count !== undefined && (isNaN(count) || count < 0 || !Number.isInteger(count))) {
    return next(new AppError('Số lượng phải là số nguyên không âm', 400));
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const voucher = await Voucher.create({
    code,
    count: count !== undefined ? count : 100, // Mặc định 100 lần sử dụng
    discount,
    expiryDate,
    description,
    created_at: Date.now(),
    updated_at: Date.now()
  });

  logger.info(`Tạo phiếu giảm giá: ${code}`);
  // Thêm notification voucher mới
  notifications.unshift({
    id: Date.now(),
    type: 'voucher',
    message: `Voucher mới ${code} vừa được tạo`,
    createdAt: new Date(),
    isRead: false
  });
  res.status(201).json({
    status: 'thành công',
    data: { voucher }
  });
});

// Lấy tất cả phiếu giảm giá (cập nhật trạng thái động)
exports.getVouchers = catchAsync(async (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;
  let vouchers = await Voucher.find().skip(skip).limit(limit);
  const total = await Voucher.countDocuments();
  // Cập nhật trạng thái động
  for (let voucher of vouchers) {
    const oldStatus = voucher.status;
    voucher.updateStatus();
    if (voucher.status !== oldStatus) await voucher.save();
  }
  res.status(200).json({
    status: 'thành công',
    results: total,
    data: { vouchers }
  });
});

// Vô hiệu hóa/kích hoạt voucher thủ công
exports.setVoucherStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) {
    return next(new AppError('Trạng thái không hợp lệ', 400));
  }
  const voucher = await Voucher.findById(req.params.id);
  if (!voucher) return next(new AppError('Không tìm thấy phiếu giảm giá', 404));
  voucher.status = status;
  await voucher.save();
  res.status(200).json({ status: 'thành công', data: { voucher } });
});

// Cập nhật điều kiện voucher
exports.updateVoucherConditions = catchAsync(async (req, res, next) => {
  const { conditions } = req.body;
  const voucher = await Voucher.findById(req.params.id);
  if (!voucher) return next(new AppError('Không tìm thấy phiếu giảm giá', 404));
  voucher.conditions = { ...voucher.conditions, ...conditions };
  await voucher.save();
  res.status(200).json({ status: 'thành công', data: { voucher } });
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

// Cập nhật phiếu giảm giá
exports.updateVoucher = catchAsync(async (req, res, next) => {
  const { code, discount, expiryDate, description, count } = req.body;
  if (!code || !discount || !description || !expiryDate) {
    return next(new AppError('Thiếu các trường bắt buộc: code, discount, expiryDate, description', 400));
  }
  if (discount < 0 || discount > 100) {
    return next(new AppError('Giảm giá phải nằm trong khoảng 0-100', 400));
  }
  if (count !== undefined && (isNaN(count) || count < 0 || !Number.isInteger(count))) {
    return next(new AppError('Số lượng phải là số nguyên không âm', 400));
  }
  const voucher = await Voucher.findByIdAndUpdate(
    req.params.id,
    { code, discount, expiryDate, description, ...(count !== undefined ? { count } : {}) },
    { new: true, runValidators: true }
  );
  if (!voucher) {
    return next(new AppError('Không tìm thấy phiếu giảm giá', 404));
  }
  logger.info(`Cập nhật phiếu giảm giá: ${voucher.code}`);
  res.status(200).json({
    status: 'thành công',
    data: { voucher }
  });
});