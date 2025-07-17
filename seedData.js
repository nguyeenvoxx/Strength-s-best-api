const mongoose = require('mongoose');
const connectDB = require('./src/config/db'); // Nhập connectDB
const User = require('./src/models/User');
const Favorite = require('./src/models/favorite');
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
const bcrypt = require('bcryptjs');

// Dữ liệu mẫu
const categoriesData = [
  { nameCategory: 'Vitamin & Khoáng chất', created_at: Date.now(), updated_at: Date.now() },
  { nameCategory: 'Bột Protein', created_at: Date.now(), updated_at: Date.now() },
  { nameCategory: 'Thực phẩm bổ sung năng lượng', created_at: Date.now(), updated_at: Date.now() },
  { nameCategory: 'Thực phẩm chức năng', created_at: Date.now(), updated_at: Date.now() },
  { nameCategory: 'Dinh dưỡng thể thao', created_at: Date.now(), updated_at: Date.now() }
];

const brandsData = [
  { name: 'NatureMade', created_at: Date.now(), updated_at: Date.now() },
  { name: 'GNC', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Optimum Nutrition', created_at: Date.now(), updated_at: Date.now() },
  { name: 'MuscleTech', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Now Foods', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Kirkland Signature', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Centrum', created_at: Date.now(), updated_at: Date.now() },
  { name: 'Garden of Life', created_at: Date.now(), updated_at: Date.now() },
  { name: 'MyProtein', created_at: Date.now(), updated_at: Date.now() },
  { name: 'BSN', created_at: Date.now(), updated_at: Date.now() }
];

const usersData = [
  { name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', password: 'password123', phoneNumber: '+84912345678', address: '123 Đường Láng, Hà Nội', role: 'admin', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Trần Thị B', email: 'tranthib@example.com', password: 'password123', phoneNumber: '+84987654321', address: '456 Nguyễn Huệ, TP.HCM', role: 'admin', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Lê Văn C', email: 'levanc@example.com', password: 'password123', phoneNumber: '+84912345679', address: '789 Hai Bà Trưng, Đà Nẵng', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Phạm Thị D', email: 'phamthid@example.com', password: 'password123', phoneNumber: '+84912345680', address: '101 Lê Lợi, Huế', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Hoàng Văn E', email: 'hoangvane@example.com', password: 'password123', phoneNumber: '+84912345681', address: '202 Trần Phú, Nha Trang', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Ngô Thị F', email: 'ngothif@example.com', password: 'password123', phoneNumber: '+84912345682', address: '303 Phạm Ngũ Lão, Hà Nội', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Đinh Văn G', email: 'dinhvang@example.com', password: 'password123', phoneNumber: '+84912345683', address: '404 Lý Thường Kiệt, TP.HCM', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Vũ Thị H', email: 'vuthih@example.com', password: 'password123', phoneNumber: '+84912345684', address: '505 Nguyễn Trãi, Đà Nẵng', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Bùi Văn I', email: 'buivani@example.com', password: 'password123', phoneNumber: '+84912345685', address: '606 Hùng Vương, Huế', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Lý Thị K', email: 'lythik@example.com', password: 'password123', phoneNumber: '+84912345686', address: '707 Trần Hưng Đạo, Nha Trang', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Trương Văn L', email: 'truongvanl@example.com', password: 'password123', phoneNumber: '+84912345687', address: '808 Lê Duẩn, Hà Nội', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Hà Thị M', email: 'hathim@example.com', password: 'password123', phoneNumber: '+84912345688', address: '909 Nguyễn Văn Cừ, TP.HCM', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Đặng Văn N', email: 'dangvann@example.com', password: 'password123', phoneNumber: '+84912345689', address: '1010 Phạm Văn Đồng, Đà Nẵng', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Nguyen Thi O', email: 'nguyenthio@example.com', password: 'password123', phoneNumber: '+84912345690', address: '1111 Lê Lợi, Huế', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Phan Văn P', email: 'phanvanp@example.com', password: 'password123', phoneNumber: '+84912345691', address: '1212 Trần Phú, Nha Trang', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Võ Thị Q', email: 'vothiq@example.com', password: 'password123', phoneNumber: '+84912345692', address: '1313 Phạm Ngũ Lão, Hà Nội', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Lưu Văn R', email: 'luuvanr@example.com', password: 'password123', phoneNumber: '+84912345693', address: '1414 Lý Thường Kiệt, TP.HCM', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Hồ Thị S', email: 'hothis@example.com', password: 'password123', phoneNumber: '+84912345694', address: '1515 Nguyễn Trãi, Đà Nẵng', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Đoàn Văn T', email: 'doanvant@example.com', password: 'password123', phoneNumber: '+84912345695', address: '1616 Hùng Vương, Huế', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() },
  { name: 'Mai Thị U', email: 'maithiu@example.com', password: 'password123', phoneNumber: '+84912345696', address: '1717 Trần Hưng Đạo, Nha Trang', role: 'user', status: 'active', createdAt: Date.now(), updatedAt: Date.now() }
];

const productsData = [
  { nameProduct: 'Vitamin C 1000mg', priceProduct: 10, quantity: 100, image: 'vitamin_c.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Vitamin C tăng cường hệ miễn dịch', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Whey Protein Gold', priceProduct: 50, quantity: 50, image: 'whey_protein.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Bột protein cho cơ bắp', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Omega-3 Fish Oil', priceProduct: 15, quantity: 80, image: 'omega3.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Dầu cá tốt cho tim mạch', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Multivitamin Daily', priceProduct: 20, quantity: 120, image: 'multivitamin.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Vitamin tổng hợp hàng ngày', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Collagen Beauty', priceProduct: 30, quantity: 60, image: 'collagen.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Collagen cho da đẹp', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'BCAA Energy', priceProduct: 25, quantity: 70, image: 'bcaa.jpg', status: 'active', idBrand: null, idCategory: null, description: 'BCAA tăng năng lượng', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Glucosamine', priceProduct: 18, quantity: 90, image: 'glucosamine.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Hỗ trợ xương khớp', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Probiotic Gut', priceProduct: 22, quantity: 100, image: 'probiotic.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Lợi khuẩn cho tiêu hóa', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Creatine Monohydrate', priceProduct: 35, quantity: 40, image: 'creatine.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Creatine tăng sức mạnh', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Magnesium 400mg', priceProduct: 12, quantity: 110, image: 'magnesium.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Magnesium hỗ trợ thần kinh', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Vitamin D3 2000IU', priceProduct: 14, quantity: 95, image: 'vitamin_d3.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Vitamin D cho xương', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Pre-Workout Booster', priceProduct: 28, quantity: 55, image: 'pre_workout.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Tăng năng lượng trước tập', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Calcium 600mg', priceProduct: 16, quantity: 85, image: 'calcium.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Canxi cho xương chắc khỏe', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Zinc 50mg', priceProduct: 11, quantity: 105, image: 'zinc.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Kẽm tăng cường miễn dịch', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Green Tea Extract', priceProduct: 19, quantity: 75, image: 'green_tea.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Chiết xuất trà xanh giảm cân', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'CoQ10 100mg', priceProduct: 27, quantity: 65, image: 'coq10.jpg', status: 'active', idBrand: null, idCategory: null, description: 'CoQ10 hỗ trợ tim mạch', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Ashwagandha', priceProduct: 23, quantity: 80, image: 'ashwagandha.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Thảo dược giảm stress', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'L-Carnitine', priceProduct: 29, quantity: 60, image: 'l_carnitine.jpg', status: 'active', idBrand: null, idCategory: null, description: 'L-Carnitine đốt mỡ', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'Iron 65mg', priceProduct: 13, quantity: 100, image: 'iron.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Sắt bổ máu', createdAt: Date.now(), updatedAt: Date.now() },
  { nameProduct: 'B-Complex', priceProduct: 17, quantity: 90, image: 'b_complex.jpg', status: 'active', idBrand: null, idCategory: null, description: 'Vitamin B tổng hợp', createdAt: Date.now(), updatedAt: Date.now() }
];

const vouchersData = [
  { code: 'HEALTH10', count: 100, discount: 10, expiryDate: new Date('2025-08-10'), description: 'Giảm 10% cho đơn hàng sức khỏe', created_at: Date.now(), updated_at: Date.now() },
  { code: 'FITNESS20', count: 90, discount: 20, expiryDate: new Date('2025-08-05'), description: 'Giảm 20% cho đơn hàng thể thao', created_at: Date.now(), updated_at: Date.now() },
  { code: 'VITAMIN15', count: 80, discount: 15, expiryDate: new Date('2025-08-15'), description: 'Giảm 15% cho vitamin', created_at: Date.now(), updated_at: Date.now() },
  { code: 'PROTEIN25', count: 70, discount: 25, expiryDate: new Date('2025-08-20'), description: 'Giảm 25% cho bột protein', created_at: Date.now(), updated_at: Date.now() },
  { code: 'WELLNESS30', count: 60, discount: 30, expiryDate: new Date('2025-08-25'), description: 'Giảm 30% cho thực phẩm chức năng', created_at: Date.now(), updated_at: Date.now() },
  { code: 'BEAUTY10', count: 50, discount: 10, expiryDate: new Date('2025-08-30'), description: 'Giảm 10% cho sản phẩm làm đẹp', created_at: Date.now(), updated_at: Date.now() },
  { code: 'ENERGY15', count: 40, discount: 15, expiryDate: new Date('2025-09-01'), description: 'Giảm 15% cho thực phẩm năng lượng', created_at: Date.now(), updated_at: Date.now() },
  { code: 'JOINT20', count: 30, discount: 20, expiryDate: new Date('2025-09-05'), description: 'Giảm 20% cho xương khớp', created_at: Date.now(), updated_at: Date.now() },
  { code: 'OMEGA25', count: 20, discount: 25, expiryDate: new Date('2025-09-10'), description: 'Giảm 25% cho dầu cá', created_at: Date.now(), updated_at: Date.now() },
  { code: 'SLIM10', count: 10, discount: 10, expiryDate: new Date('2025-09-15'), description: 'Giảm 10% cho sản phẩm giảm cân', created_at: Date.now(), updated_at: Date.now() }
];

const ordersData = [
  { idUser: null, totalPrice: 30, status: 'pending', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 50, status: 'processing', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 70, status: 'shipped', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 90, status: 'pending', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 110, status: 'processing', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 130, status: 'shipped', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 150, status: 'delivered', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 170, status: 'pending', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 190, status: 'processing', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, totalPrice: 210, status: 'shipped', created_at: Date.now(), updated_at: Date.now() }
];

const orderDetailsData = [
  { idOrder: null, idProduct: null, price: 10, name: 'Vitamin C 1000mg', quantity: 3, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 50, name: 'Whey Protein Gold', quantity: 1, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 15, name: 'Omega-3 Fish Oil', quantity: 2, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 20, name: 'Multivitamin Daily', quantity: 4, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 30, name: 'Collagen Beauty', quantity: 2, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 25, name: 'BCAA Energy', quantity: 3, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 18, name: 'Glucosamine', quantity: 5, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 22, name: 'Probiotic Gut', quantity: 2, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 35, name: 'Creatine Monohydrate', quantity: 1, created_at: Date.now(), updated_at: Date.now() },
  { idOrder: null, idProduct: null, price: 12, name: 'Magnesium 400mg', quantity: 3, created_at: Date.now(), updated_at: Date.now() }
];

const paymentsData = [
  { orderId: null, amount: 30, method: 'credit_card', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 50, method: 'cash_on_delivery', status: 'completed', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 70, method: 'paypal', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 90, method: 'credit_card', status: 'completed', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 110, method: 'cash_on_delivery', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 130, method: 'paypal', status: 'completed', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 150, method: 'credit_card', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 170, method: 'cash_on_delivery', status: 'completed', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 190, method: 'paypal', status: 'pending', createdAt: Date.now(), updatedAt: Date.now() },
  { orderId: null, amount: 210, method: 'credit_card', status: 'completed', createdAt: Date.now(), updatedAt: Date.now() }
];

const cartsData = [
  { idUser: null, items: [{ idProduct: null, quantity: 2, price: 10 }], totalPrice: 20, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 1, price: 50 }], totalPrice: 50, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 3, price: 15 }], totalPrice: 45, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 2, price: 20 }], totalPrice: 40, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 1, price: 30 }], totalPrice: 30, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 4, price: 25 }], totalPrice: 100, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 2, price: 18 }], totalPrice: 36, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 3, price: 22 }], totalPrice: 66, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 1, price: 35 }], totalPrice: 35, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, items: [{ idProduct: null, quantity: 2, price: 12 }], totalPrice: 24, created_at: Date.now(), updated_at: Date.now() }
];

const favoritesData = [
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, created_at: Date.now(), updated_at: Date.now() }
];

const reviewsData = [
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 5, review: 'Sản phẩm rất tốt!', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 4, review: 'Hiệu quả, đáng mua.', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 3, review: 'Tạm được, cần cải thiện.', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 5, review: 'Rất hài lòng!', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 4, review: 'Sản phẩm chất lượng.', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 2, review: 'Không như kỳ vọng.', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 5, review: 'Tuyệt vời, sẽ mua lại.', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 4, review: 'Tốt, giao hàng nhanh.', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 3, review: 'Bình thường, ổn.', created_at: Date.now(), updated_at: Date.now() },
  { idUser: null, idProduct: null, idOrderDetail: null, rating: 5, review: 'Sản phẩm xuất sắc!', created_at: Date.now(), updated_at: Date.now() }
];

async function seedData() {
  try {
    await connectDB();
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

    // Hash mật khẩu cho tất cả user
    for (let user of usersData) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    // Thêm tài khoản admin chuẩn
    const adminEmail = 'admin@example.com';
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    usersData.push({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      phoneNumber: '+84900000000',
      address: 'Admin Address',
      role: 'admin',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Nạp dữ liệu mới
    const users = await User.insertMany(usersData);
    logger.info('Nạp dữ liệu người dùng thành công');

    const categories = await Category.insertMany(categoriesData);
    const brands = await Brand.insertMany(brandsData);

    // Cập nhật idBrand và idCategory cho sản phẩm
    productsData.forEach((product, i) => {
      product.idBrand = brands[i % brands.length]._id;
      product.idCategory = categories[i % categories.length]._id;
    });
    const products = await Product.insertMany(productsData);

    const vouchers = await Voucher.insertMany(vouchersData);

    // Cập nhật idUser cho đơn hàng, giỏ hàng, yêu thích, đánh giá
    ordersData.forEach((order, i) => {
      order.idUser = users[i % users.length]._id;
    });
    const orders = await Order.insertMany(ordersData);

    orderDetailsData.forEach((detail, i) => {
      detail.idOrder = orders[i % orders.length]._id;
      detail.idProduct = products[i % products.length]._id;
      detail.price = products[i % products.length].priceProduct;
      detail.name = products[i % products.length].nameProduct;
    });
    const orderDetails = await OrderDetail.insertMany(orderDetailsData);

    paymentsData.forEach((payment, i) => {
      payment.orderId = orders[i % orders.length]._id;
      payment.amount = orders[i % orders.length].totalPrice;
    });
    const payments = await Payment.insertMany(paymentsData);

    cartsData.forEach((cart, i) => {
      cart.idUser = users[i % users.length]._id;
      cart.items[0].idProduct = products[i % products.length]._id;
      cart.items[0].price = products[i % products.length].priceProduct;
      cart.totalPrice = cart.items[0].price * cart.items[0].quantity;
    });
    const carts = await Cart.insertMany(cartsData);

    favoritesData.forEach((favorite, i) => {
      favorite.idUser = users[i % users.length]._id;
      favorite.idProduct = products[i % products.length]._id;
    });
    const favorites = await Favorite.insertMany(favoritesData);

    reviewsData.forEach((review, i) => {
      review.idUser = users[i % users.length]._id;
      review.idProduct = products[i % products.length]._id;
      review.idOrderDetail = orderDetails[i % orderDetails.length]._id;
    });
    const reviews = await ProductReview.insertMany(reviewsData);

    logger.info('Nạp dữ liệu mẫu thành công');
  } catch (err) {
    logger.error(`Lỗi khi nạp dữ liệu: ${err.message}`);
  } finally {
    await mongoose.connection.close();
    logger.info('Đóng kết nối MongoDB');
  }
}

seedData();