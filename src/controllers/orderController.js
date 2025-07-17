const Order = require('../models/Order');
const OrderDetail = require('../models/orderDetail');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Tạo đơn hàng
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items } = req.body;
  const userId = req.user._id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Danh sách sản phẩm không hợp lệ', 400));
  }

  let totalPrice = 0;
  const orderDetails = [];

  for (const item of items) {
    const { idProduct, quantity } = item;
    if (!idProduct || !quantity || quantity < 1) {
      return next(new AppError('ID sản phẩm hoặc số lượng không hợp lệ', 400));
    }

    const product = await Product.findById(idProduct);
    if (!product) {
      return next(new AppError(`Không tìm thấy sản phẩm ${idProduct}`, 404));
    }

    if (product.quantity < quantity) {
      return next(new AppError(`Sản phẩm ${product.nameProduct} không đủ số lượng`, 400));
    }

    totalPrice += product.priceProduct * quantity;
    orderDetails.push({
      idOrder: null, // Sẽ cập nhật sau
      idProduct,
      price: product.priceProduct,
      name: product.nameProduct,
      quantity,
      created_at: Date.now(),
      updated_at: Date.now()
    });
  }

  const order = await Order.create({
    idUser: userId,
    totalPrice,
    status: 'pending',
    created_at: Date.now(),
    updated_at: Date.now()
  });

  orderDetails.forEach(detail => (detail.idOrder = order._id));
  await OrderDetail.insertMany(orderDetails);

  // Cập nhật số lượng sản phẩm
  for (const item of items) {
    await Product.findByIdAndUpdate(item.idProduct, {
      $inc: { quantity: -item.quantity }
    });
  }

  logger.info(`Tạo đơn hàng ${order._id} cho người dùng ${userId}`);
  res.status(201).json({
    status: 'thành công',
    data: { order }
  });
});

// Lấy tất cả đơn hàng
exports.getOrders = catchAsync(async (req, res, next) => {
  let filter = {};
  // Nếu không phải admin, chỉ lấy đơn hàng của user đó
  if (req.user.role !== 'admin') {
    filter = { idUser: req.user._id };
  }

  const orders = await Order.find(filter).populate('idUser', 'name email');

  res.status(200).json({
    status: 'thành công',
    results: orders.length,
    data: { orders }
  });
});

// Xóa đơn hàng
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    return next(new AppError('Không tìm thấy đơn hàng', 404));
  }

  await OrderDetail.deleteMany({ idOrder: req.params.id });
  logger.info(`Xóa đơn hàng ${req.params.id}`);
  res.status(204).json({
    status: 'thành công',
    data: null
  });
});