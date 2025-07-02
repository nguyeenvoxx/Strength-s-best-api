const mongoose = require('mongoose');

// Schema cho giỏ hàng
const cartSchema = new mongoose.Schema({
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    idProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  totalPrice: { type: Number, required: true, min: 0, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tạo index cho idUser
cartSchema.index({ idUser: 1 });

// Cập nhật updated_at khi sửa
cartSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('Cart', cartSchema);