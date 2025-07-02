const mongoose = require('mongoose');

// Schema cho thương hiệu
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Cập nhật updated_at khi sửa
brandSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('Brand', brandSchema);