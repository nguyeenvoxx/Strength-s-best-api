const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Thêm sản phẩm vào danh sách yêu thích
exports.addToFavorites = catchAsync(async (req, res, next) => {
  const { idProduct } = req.body;
  const userId = req.user._id;

  if (!idProduct) {
    return next(new AppError('ID sản phẩm là bắt buộc', 400));
  }

  const product = await Product.findById(idProduct);
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  const existingFavorite = await Favorite.findOne({ idUser: userId, idProduct });
  if (existingFavorite) {
    return next(new AppError('Sản phẩm đã có trong danh sách yêu thích', 400));
  }

  const favorite = await Favorite.create({
    idUser: userId,
    idProduct,
    created_at: Date.now(),
    updated_at: Date.now()
  });

  logger.info(`Thêm sản phẩm ${idProduct} vào danh sách yêu thích của người dùng ${userId}`);
  res.status(201).json({
    status: 'thành công',
    data: { favorite }
  });
});

// Lấy danh sách yêu thích
exports.getFavorites = catchAsync(async (req, res, next) => {
  const favorites = await Favorite.find({ idUser: req.user._id }).populate('idProduct');
  res.status(200).json({
    status: 'thành công',
    results: favorites.length,
    data: { favorites }
  });
});

// Xóa sản phẩm khỏi danh sách yêu thích
exports.removeFromFavorites = catchAsync(async (req, res, next) => {
  const favorite = await Favorite.findByIdAndDelete(req.params.id);
  if (!favorite) {
    return next(new AppError('Không tìm thấy mục yêu thích', 404));
  }

  logger.info(`Xóa sản phẩm yêu thích ${req.params.id} của người dùng ${req.user._id}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});