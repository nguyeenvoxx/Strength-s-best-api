// Cấu hình ứng dụng Strength Best API
module.exports = {
  app: {
    port: 3000, // Cổng chạy API
    env: 'development', // Môi trường: development, production, hoặc test
    jwt: {
      secret: 'my-very-secure-jwt-secret-123', // Chuỗi bí mật để tạo JWT
      expiresIn: '90d', // Thời gian hết hạn token (90 ngày)
    },
    cookieSecret: 'strength-best-cookie-secret', // Chuỗi bí mật cho cookie
  },
  db: {
    uri: 'mongodb://localhost:27017/strength-best', // URI MongoDB hard-coded
    options: {}, // Xóa các tùy chọn không còn được hỗ trợ
  },
  client: {
    url: 'http://localhost:8080', // URL frontend (dùng cho CORS hoặc redirect)
  },
};