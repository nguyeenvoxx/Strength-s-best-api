const mongoose = require('mongoose');

// Schema cho đơn hàng
const orderSchema = new mongoose.Schema({
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tạo index cho idUser và status
orderSchema.index({ idUser: 1, status: 1 });

// Cập nhật updated_at khi sửa
orderSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('Order', orderSchema);