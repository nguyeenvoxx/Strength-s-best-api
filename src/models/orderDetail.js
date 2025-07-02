const mongoose = require('mongoose');

// Schema cho chi tiết đơn hàng
const orderDetailSchema = new mongoose.Schema({
  idOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  idProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true, min: 0 },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tạo index ghép cho idOrder và idProduct
orderDetailSchema.index({ idOrder: 1, idProduct: 1 });

// Cập nhật updated_at khi sửa
orderDetailSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);