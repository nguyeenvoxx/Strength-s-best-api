const Brand = require('../models/Brand');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo thương hiệu
exports.createBrand = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new AppError('Tên thương hiệu là bắt buộc', 400));
  }

  const brand = await Brand.create({
    name,
    created_at: Date.now(),
    updated_at: Date.now()
  });

  logger.info(`Tạo thương hiệu: ${name}`);
  res.status(201).json({
    status: 'thành công',
    data: { brand }
  });
});

// Lấy tất cả thương hiệu
exports.getBrands = catchAsync(async (req, res, next) => {
  const brands = await Brand.find();
  res.status(200).json({
    status: 'thành công',
    results: brands.length,
    data: { brands }
  });
});

// Cập nhật thương hiệu
exports.updateBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!brand) {
    return next(new AppError('Không tìm thấy thương hiệu', 404));
  }

  logger.info(`Cập nhật thương hiệu: ${brand.name}`);
  res.status(200).json({
    status: 'thành công',
    data: { brand }
  });
});

// Xóa thương hiệu
exports.deleteBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    return next(new AppError('Không tìm thấy thương hiệu', 404));
  }

  logger.info(`Xóa thương hiệu: ${brand.name}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});