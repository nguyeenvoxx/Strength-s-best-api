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

// Dữ liệu mẫu
const categoriesData = [
  { name: 'Vitamin & Khoáng chất', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Bột Protein', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Thực phẩm bổ sung năng lượng', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Thực phẩm chức năng', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Dinh dưỡng thể thao', created_at: Date.now(), updated_at: Date.now() }
];

const brandsData = [
  { name: 'NatureMade', created_at: Date.now(), updated_at: Date.now() },
  { name: 'GNC', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Optimum Nutrition', created_at: Date.now(), updated_at: Date.now() },
  { name: 'MuscleTech', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Now Foods', created_at: Date.now(), updated_at: Date.now() }
];

const usersData = [
  {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    password: 'password123',
    phoneNumber: '+84912345678',
    address: '123 Đường Láng, Hà Nội',
    role: 'user',
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    password: 'password123',
    phoneNumber: '+84987654321',
    address: '456 Nguyễn Huệ, TP.HCM',
    role: 'admin',
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const paymentMethodsData = [
  { orderId: null, amount: 0, method: 'credit_card', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 0, method: 'cash_on_delivery', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 0, method: 'paypal', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() }
];

const productsData = [
  {
    nameProduct: 'Vitamin C 1000mg',
    priceProduct: 10,
    quantity: 100,
    image: 'vitamin_c.jpg',
    status: 'active',
    idBrand: null, // Sẽ cập nhật sau
    idCategory: null, // Sẽ cập nhật sau
    description: 'Vitamin C tăng cường hệ miễn dịch',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    nameProduct: 'Whey Protein',
    priceProduct: 50,
    quantity: 50,
    image: 'whey_protein.jpg',
    status: 'active',
    idBrand: null, // Sẽ cập nhật sau
    idCategory: null, // Sẽ cập nhật sau
    description: 'Bột protein cho cơ bắp',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const vouchersData = [
  {
    code: 'HEALTH10',
    count: 100,
    discount: 10,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    description: 'Giảm 10% cho đơn hàng sức khỏe',
    created_at: Date.now(),
    updated_at: Date.now()
  }
];

async function seedData() {
  try {
    await connectDB(); // Sử dụng connectDB
    logger.info('Kết nối MongoDB để nạp dữ liệu');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Favorite.deleteMany({}),
      Cart.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Brand.deleteMany({}),
      Order.deleteMany({}),
      OrderDetail.deleteMany({}),
      Payment.deleteMany({}),
      Voucher.deleteMany({}),
      ProductReview.deleteMany({})
    ]);
    logger.info('Xóa dữ liệu cũ thành công');

    // Nạp dữ liệu mới
    const categories = await Category.insertMany(categoriesData);
    const brands = await Brand.insertMany(brandsData);
    const users = await User.insertMany(usersData);

    // Cập nhật idBrand và idCategory cho sản phẩm
    productsData[0].idBrand = brands[0]._id;
    productsData[0].idCategory = categories[0]._id;
    productsData[1].idBrand = brands[2]._id;
    productsData[1].idCategory = categories[1]._id;
    const products = await Product.insertMany(productsData);

    const vouchers = await Voucher.insertMany(vouchersData);

    // Tạo đơn hàng mẫu
    const ordersData = [
      {
        idUser: users[0]._id,
        totalPrice: 30,
        status: 'pending',
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ];
    const orders = await Order.insertMany(ordersData);

    // Cập nhật paymentMethodsData với orderId
    paymentMethodsData[0].orderId = orders[0]._id;
    paymentMethodsData[0].amount = 30;
    paymentMethodsData[1].orderId = orders[0]._id;
    paymentMethodsData[1].amount = 30;
    paymentMethodsData[2].orderId = orders[0]._id;
    paymentMethodsData[2].amount = 30;
    const payments = await Payment.insertMany(paymentMethodsData);

    const orderDetailsData = [
      {
        idOrder: orders[0]._id,
        idProduct: products[0]._id,
        price: products[0].priceProduct,
        name: products[0].nameProduct,
        quantity: 3,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ];
    const orderDetails = await OrderDetail.insertMany(orderDetailsData);

    // Tạo đánh giá mẫu
    const reviewsData = [
      {
        idUser: users[0]._id,
        idProduct: products[0]._id,
        idOrderDetail: orderDetails[0]._id,
        rating: 5,
        review: 'Sản phẩm rất tốt!',
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ];
    await ProductReview.insertMany(reviewsData);

    // Tạo giỏ hàng và yêu thích mẫu
    const cartsData = [
      {
        idUser: users[0]._id,
        items: [{ idProduct: products[0]._id, quantity: 2, price: products[0].priceProduct }],
        totalPrice: 2 * products[0].priceProduct,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ];
    await Cart.insertMany(cartsData);

    const favoritesData = [
      {
        idUser: users[0]._id,
        idProduct: products[0]._id,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ];
    await Favorite.insertMany(favoritesData);

    logger.info('Nạp dữ liệu mẫu thành công');
  } catch (err) {
    logger.error(`Lỗi khi nạp dữ liệu: ${err.message}`);
  } finally {
    await mongoose.connection.close();
    logger.info('Đóng kết nối MongoDB');
  }
}

seedData();