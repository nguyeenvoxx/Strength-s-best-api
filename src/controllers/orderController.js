const Order = require('../models/Order');
const OrderDetail = require('../models/orderDetail');
const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Mock notifications lưu trong RAM
const notifications = [];
module.exports.notifications = notifications;

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
  // Thêm notification đơn hàng mới
  notifications.unshift({
    id: Date.now(),
    type: 'order',
    message: `Đơn hàng mới #${order._id} vừa được tạo`,
    createdAt: new Date(),
    isRead: false
  });
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
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter).populate('idUser', 'name email').skip(skip).limit(limit);
  res.status(200).json({
    status: 'thành công',
    results: total,
    data: { orders }
  });
});

// Lấy chi tiết đơn hàng
exports.getOrderDetail = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('idUser', 'name email');
  if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404));
  const orderDetails = await OrderDetail.find({ idOrder: order._id }).populate('idProduct', 'nameProduct priceProduct');
  const payment = await require('../models/payment').findOne({ orderId: order._id });
  res.status(200).json({
    status: 'thành công',
    data: {
      order,
      orderDetails,
      payment
    }
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

// API lấy notifications mới nhất
exports.getNotifications = catchAsync(async (req, res, next) => {
  // Trả về 20 thông báo mới nhất
  res.status(200).json({
    status: 'thành công',
    data: notifications.slice(0, 20)
  });
});

exports.search = catchAsync(async (req, res, next) => {
  const { query, type } = req.query;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(200).json({ status: 'thành công', data: { orders: [], users: [], products: [] } });
  }
  const q = query.trim();
  let orders = [], users = [], products = [];
  if (!type || type === 'all' || type === 'order') {
    orders = await Order.find({
      $or: [
        { _id: q },
        { status: { $regex: q, $options: 'i' } },
        { totalPrice: isNaN(Number(q)) ? undefined : Number(q) }
      ].filter(Boolean)
    }).populate('idUser', 'name email');
  }
  if (!type || type === 'all' || type === 'user') {
    users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } }
      ]
    });
  }
  if (!type || type === 'all' || type === 'product') {
    products = await Product.find({
      $or: [
        { nameProduct: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
  }
  res.status(200).json({
    status: 'thành công',
    data: { orders, users, products }
  });
});