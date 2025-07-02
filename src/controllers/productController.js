const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo sản phẩm
exports.createProduct = catchAsync(async (req, res, next) => {
  const { nameProduct, priceProduct, quantity, image, status, idBrand, idCategory, description } = req.body;

  if (!nameProduct || !priceProduct || !quantity || !image || !status || !idBrand || !idCategory) {
    return next(new AppError('Thiếu các trường bắt buộc', 400));
  }

  const product = await Product.create({
    nameProduct,
    priceProduct,
    quantity,
    image,
    status,
    idBrand,
    idCategory,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  logger.info(`Tạo sản phẩm: ${nameProduct}`);
  res.status(201).json({
    status: 'thành công',
    data: { product }
  });
});

// Lấy tất cả sản phẩm
exports.getProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  if (!products.length) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  res.status(200).json({
    status: 'thành công',
    results: products.length,
    data: { products }
  });
});

// Lấy một sản phẩm
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('idBrand idCategory');
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  res.status(200).json({
    status: 'thành công',
    data: { product }
  });
});

// Cập nhật sản phẩm
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  logger.info(`Cập nhật sản phẩm: ${product.nameProduct}`);
  res.status(200).json({
    status: 'thành công',
    data: { product }
  });
});

// Xóa sản phẩm
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  logger.info(`Xóa sản phẩm: ${product.nameProduct}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});