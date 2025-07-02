const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = catchAsync(async (req, res, next) => {
  const { idProduct, quantity } = req.body;
  const userId = req.user._id;

  // Kiểm tra dữ liệu đầu vào
  if (!idProduct || !quantity || quantity < 1) {
    return next(new AppError('ID sản phẩm hoặc số lượng không hợp lệ', 400));
  }

  // Kiểm tra sản phẩm tồn tại
  const product = await Product.findById(idProduct);
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  // Tìm hoặc tạo giỏ hàng
  let cart = await Cart.findOne({ idUser: userId });
  if (!cart) {
    cart = await Cart.create({
      idUser: userId,
      items: [],
      totalPrice: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    });
  }

  // Cập nhật hoặc thêm sản phẩm vào giỏ
  const itemIndex = cart.items.findIndex(item => item.idProduct.toString() === idProduct);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ idProduct, quantity, price: product.priceProduct });
  }

  // Tính tổng giá
  cart.totalPrice = cart.items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);

  cart.updated_at = Date.now();
  await cart.save();

  logger.info(`Thêm sản phẩm ${idProduct} vào giỏ hàng của người dùng ${userId}`);
  res.status(200).json({
    status: 'thành công',
    data: { cart }
  });
});

// Lấy giỏ hàng
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ idUser: req.user._id }).populate('items.idProduct');
  if (!cart) {
    return next(new AppError('Không tìm thấy giỏ hàng', 404));
  }

  res.status(200).json({
    status: 'thành công',
    data: { cart }
  });
});

// Xóa toàn bộ giỏ hàng
exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ idUser: req.user._id });
  if (!cart) {
    return next(new AppError('Không tìm thấy giỏ hàng', 404));
  }

  cart.items = [];
  cart.totalPrice = 0;
  cart.updated_at = Date.now();
  await cart.save();

  logger.info(`Xóa giỏ hàng của người dùng ${req.user._id}`);
  res.status(200).json({
    status: 'thành công',
    data: { cart }
  });
});