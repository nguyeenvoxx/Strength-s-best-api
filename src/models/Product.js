const mongoose = require('mongoose');

// Schema cho sản phẩm
const productSchema = new mongoose.Schema({
  nameProduct: { type: String, required: true, trim: true },
  priceProduct: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  image: { type: String, trim: true, default: 'default.jpg' },
  status: { type: String, enum: ['active', 'inactive', 'available'], default: 'active' },
  idBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  idCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Tạo index cho idBrand, idCategory, status
productSchema.index({ idBrand: 1, idCategory: 1, status: 1 });

// Cập nhật updatedAt khi sửa
productSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Product', productSchema);