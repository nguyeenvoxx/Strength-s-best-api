const ProductReview = require('../models/productReview');
const OrderDetail = require('../models/orderDetail');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const Order = require('../models/Order');
const { notifications } = require('./orderController');

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
  // Thêm notification đánh giá mới
  let userName = req.user?.name || 'Người dùng';
  let productName = idProduct;
  try {
    const order = await Order.findById(orderDetail.idOrder).populate('idUser', 'name');
    if (order && order.idUser && order.idUser.name) userName = order.idUser.name;
    productName = orderDetail?.idProduct?.toString() || idProduct;
  } catch {}
  notifications.unshift({
    id: Date.now(),
    type: 'review',
    message: `Đánh giá mới cho sản phẩm ${productName} bởi ${userName}`,
    createdAt: new Date(),
    isRead: false
  });
  res.status(201).json({
    status: 'thành công',
    data: { productReview }
  });
});

// Lấy tất cả đánh giá
exports.getReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.user.role !== 'admin') {
    filter.idUser = req.user._id;
  }
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;
  const total = await ProductReview.countDocuments(filter);
  const reviews = await ProductReview.find(filter).populate('idProduct idOrderDetail idUser').skip(skip).limit(limit);
  res.status(200).json({
    status: 'thành công',
    results: total,
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

// Thêm phản hồi admin (append)
exports.addAdminReply = catchAsync(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Chỉ admin mới được trả lời đánh giá', 403));
  }
  const { content } = req.body;
  if (!content || !content.trim()) {
    return next(new AppError('Nội dung phản hồi không được để trống', 400));
  }
  const review = await ProductReview.findById(req.params.id);
  if (!review) return next(new AppError('Không tìm thấy đánh giá', 404));
  review.adminReplies.push({ content: content.trim(), admin: req.user._id });
  await review.save();
  res.status(200).json({ status: 'thành công', data: { review } });
});

// Sửa phản hồi admin (theo index)
exports.editAdminReply = catchAsync(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Chỉ admin mới được sửa phản hồi', 403));
  }
  const { replyIndex, content } = req.body;
  if (typeof replyIndex !== 'number' || replyIndex < 0) {
    return next(new AppError('Thiếu chỉ số phản hồi', 400));
  }
  const review = await ProductReview.findById(req.params.id);
  if (!review) return next(new AppError('Không tìm thấy đánh giá', 404));
  if (!review.adminReplies[replyIndex]) {
    return next(new AppError('Không tìm thấy phản hồi', 404));
  }
  if (!content || !content.trim()) {
    // Nếu bỏ trống thì xóa phản hồi
    review.adminReplies.splice(replyIndex, 1);
  } else {
    review.adminReplies[replyIndex].content = content.trim();
    review.adminReplies[replyIndex].updatedAt = Date.now();
  }
  await review.save();
  res.status(200).json({ status: 'thành công', data: { review } });
});

// Xóa phản hồi admin (theo index)
exports.deleteAdminReply = catchAsync(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Chỉ admin mới được xóa phản hồi', 403));
  }
  const { replyIndex } = req.body;
  if (typeof replyIndex !== 'number' || replyIndex < 0) {
    return next(new AppError('Thiếu chỉ số phản hồi', 400));
  }
  const review = await ProductReview.findById(req.params.id);
  if (!review) return next(new AppError('Không tìm thấy đánh giá', 404));
  if (!review.adminReplies[replyIndex]) {
    return next(new AppError('Không tìm thấy phản hồi', 404));
  }
  review.adminReplies.splice(replyIndex, 1);
  await review.save();
  res.status(200).json({ status: 'thành công', data: { review } });
});