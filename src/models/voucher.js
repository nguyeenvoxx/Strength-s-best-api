const mongoose = require('mongoose');

// Schema cho phiếu giảm giá
const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  count: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0, max: 100 },
  expiryDate: { type: Date, required: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ['active', 'expired', 'disabled'], default: 'active' },
  conditions: {
    minOrderValue: { type: Number, default: 0 },
    userLimit: { type: Number },
    // Có thể mở rộng thêm các điều kiện khác
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Cập nhật updated_at khi sửa
voucherSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

// Tự động cập nhật trạng thái khi truy vấn
voucherSchema.pre('find', function(next) {
  this.where({
    $or: [
      { expiryDate: { $gt: new Date() }, status: { $ne: 'disabled' }, count: { $gt: 0 } },
      { status: 'disabled' }
    ]
  });
  next();
});

voucherSchema.methods.updateStatus = function() {
  if (this.status === 'disabled') return this.status;
  if (this.expiryDate < new Date()) {
    this.status = 'expired';
  } else if (this.count <= 0) {
    this.status = 'expired';
  } else {
    this.status = 'active';
  }
  return this.status;
};

module.exports = mongoose.model('Voucher', voucherSchema);