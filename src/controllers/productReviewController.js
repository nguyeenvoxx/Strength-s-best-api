const ProductReview = require('../models/productReview');
const OrderDetail = require('../models/orderDetail');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo đánh giá sản phẩm
exports.createReview = catchAsync(async (req, res, next) => {
  const { idProduct, idOrderDetail, rating, review } = req.body;
  const userId = req.user._id;

  if (!idProduct || !idOrderDetail || !rating) {
    return next(new AppError('Thiếu các trường bắt buộc: idProduct, idOrderDetail, rating', 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new AppError('Điểm đánh giá phải từ 1 đến 5', 400));
  }

  const orderDetail = await OrderDetail.findById(idOrderDetail);
  if (!orderDetail || orderDetail.idProduct.toString() !== idProduct) {
    return next(new AppError('Chi tiết đơn hàng không hợp lệ', 400));
  }

  const existingReview = await ProductReview.findOne({ idUser: userId, idProduct });
  if (existingReview) {
    return next(new AppError('Bạn đã đánh giá sản phẩm này', 400));
  }

  const productReview = await ProductReview.create({
    idUser: userId,
    idProduct,
    idOrderDetail,
    rating,
    review,
    created_at: Date.now(),
    updated_at: Date.now()
  });

  logger.info(`Tạo đánh giá cho sản phẩm ${idProduct} bởi người dùng ${userId}`);
  res.status(201).json({
    status: 'thành công',
    data: { productReview }
  });
});

// Lấy tất cả đánh giá
exports.getReviews = catchAsync(async (req, res, next) => {
  const reviews = await ProductReview.find({ idUser: req.user._id }).populate('idProduct idOrderDetail');
  res.status(200).json({
    status: 'thành công',
    results: reviews.length,
    data: { reviews }
  });
});

// Xóa đánh giá
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await ProductReview.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError('Không tìm thấy đánh giá', 404));
  }

  logger.info(`Xóa đánh giá ${req.params.id}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});