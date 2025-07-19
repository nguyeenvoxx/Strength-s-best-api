const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo danh mục
exports.createCategory = catchAsync(async (req, res, next) => {
  const { nameCategory } = req.body;

  if (!nameCategory) {
    return next(new AppError('Tên danh mục là bắt buộc', 400));
  }

  const category = await Category.create({
    nameCategory,
    created_at: Date.now(),
    updated_at: Date.now()
  });

  logger.info(`Tạo danh mục: ${nameCategory}`);
  res.status(201).json({
    status: 'thành công',
    data: { category }
  });
});

// Lấy tất cả danh mục
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: 'thành công',
    results: categories.length,
    data: { categories }
  });
});

// Cập nhật danh mục
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!category) {
    return next(new AppError('Không tìm thấy danh mục', 404));
  }
  
  logger.info(`Cập nhật danh mục: ${category.nameCategory}`);
  res.status(200).json({
    status: 'thành công',
    data: { category }
  });
});


// Xóa danh mục
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError('Không tìm thấy danh mục', 404));
  }

  logger.info(`Xóa danh mục: ${category.name}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});