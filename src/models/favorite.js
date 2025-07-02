const mongoose = require('mongoose');

// Schema cho danh sách yêu thích
const favoriteSchema = new mongoose.Schema({
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tạo index ghép cho idUser và idProduct
favoriteSchema.index({ idUser: 1, idProduct: 1 }, { unique: true });

// Cập nhật updated_at khi sửa
favoriteSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('Favorite', favoriteSchema);