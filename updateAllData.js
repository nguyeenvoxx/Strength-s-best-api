const mongoose = require('mongoose');
const connectDB = require('./src/config/db'); // Nhập connectDB
const User = require('./src/models/User');
const Favorite = require('./src/models/Favorite');
const Cart = require('./src/models/Cart');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Brand = require('./src/models/Brand');
const Order = require('./src/models/Order');
const OrderDetail = require('./src/models/orderDetail');
const Payment = require('./src/models/payment');
const Voucher = require('./src/models/voucher');
const ProductReview = require('./src/models/productReview');
const logger = require('./src/utils/logger');

async function updateAllData() {
  try {
    await connectDB();
    logger.info('Kết nối MongoDB để cập nhật dữ liệu');

    // Cập nhật Users: Đặt status='active' và emailVerified=true nếu chưa có
    await User.updateMany(
      { $or: [{ status: { $exists: false } }, { status: 'pending' }, { status: 'inactive' }] },
      { status: 'active', emailVerified: true, updatedAt: Date.now() }
    );

    // Cập nhật Favorites, Carts, OrderDetails, ProductReviews
    await Promise.all([
      Favorite.updateMany({}, { updated_at: Date.now() }),
      Cart.updateMany({}, { updated_at: Date.now() }),
      OrderDetail.updateMany({}, { updated_at: Date.now() }),
      ProductReview.updateMany({}, { updated_at: Date.now() })
    ]);

    // Cắt bỏ khoảng trắng trong nameCategory (Category) và name (Brand)
    await Category.updateMany({}, [
      { $set: { nameCategory: { $trim: { input: "$nameCategory" } }, updated_at: Date.now() } }
    ]);
    await Brand.updateMany({}, [
      { $set: { name: { $trim: { input: "$name" } }, updated_at: Date.now() } }
    ]);

    // Tăng giá sản phẩm 5%
    await Product.updateMany({}, [
      { $set: { priceProduct: { $multiply: ["$priceProduct", 1.05] }, updatedAt: Date.now() } }
    ]);

    // Chuyển trạng thái đơn hàng từ pending sang processing
    await Order.updateMany(
      { status: 'pending' },
      { status: 'processing', updated_at: Date.now() }
    );

    // Đặt phương thức thanh toán mặc định
    await Payment.updateMany(
      { method: { $exists: false } },
      { method: 'cash_on_delivery', updatedAt: Date.now() }
    );

    // Giảm số lượng phiếu giảm giá
    await Voucher.updateMany(
      { count: { $gt: 10 } },
      { $inc: { count: -10 }, updated_at: Date.now() }
    );

    logger.info('Cập nhật dữ liệu thành công');
  } catch (err) {
    logger.error(`Lỗi khi cập nhật dữ liệu: ${err.message}`);
  } finally {
    await mongoose.connection.close();
    logger.info('Đóng kết nối MongoDB');
  }
}

updateAllData();