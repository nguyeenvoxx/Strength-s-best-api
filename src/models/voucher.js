const mongoose = require('mongoose');

// Schema cho phiếu giảm giá
const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  count: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0, max: 100 },
  expiryDate: { type: Date, required: true },
  description: { type: String, required: true, trim: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Cập nhật updated_at khi sửa
voucherSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('Voucher', voucherSchema);