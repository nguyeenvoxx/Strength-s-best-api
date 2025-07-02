const mongoose = require('mongoose');

// Schema cho thanh toán
const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['credit_card', 'cash_on_delivery', 'bank_transfer', 'paypal'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Tạo index cho orderId
paymentSchema.index({ orderId: 1 });

// Cập nhật updatedAt khi sửa
paymentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);