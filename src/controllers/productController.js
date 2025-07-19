const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo sản phẩm
exports.createProduct = catchAsync(async (req, res, next) => {
  const { nameProduct, priceProduct, quantity, idBrand, idCategory, status, description } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = req.file.filename;
  }

  if (!nameProduct || !priceProduct || !quantity || !idBrand || !idCategory) {
    return next(new AppError('Thiếu các trường bắt buộc: name, price, quantity, brand, category', 400));
  }
  if (Number(quantity) < 1) {
    return next(new AppError('Số lượng sản phẩm phải lớn hơn 0', 400));
  }

  const product = await Product.create({
    nameProduct,
    priceProduct,
    quantity,
    idBrand,
    idCategory,
    image: image || 'default.jpg',
    status: status || 'active',
    description: description || '',
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
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments();
  const features = new APIFeatures(Product.find().skip(skip).limit(limit), req.query)
    .filter()
    .sort()
    .limitFields();
  const products = await features.query;
  res.status(200).json({
    status: 'thành công',
    results: total,
    data: { products: products || [] }
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
  let updateData = { ...req.body };
  if (req.file) {
    updateData.image = req.file.filename;
  }
  if (updateData.quantity !== undefined && Number(updateData.quantity) < 1) {
    return next(new AppError('Số lượng sản phẩm phải lớn hơn 0', 400));
  }
  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
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