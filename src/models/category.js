const mongoose = require('mongoose');

// Schema cho danh mục
const categorySchema = new mongoose.Schema({
  nameCategory: { type: String, required: true, unique: true }, 
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Cập nhật updated_at khi sửa
categorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('Category', categorySchema);