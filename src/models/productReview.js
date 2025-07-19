const mongoose = require('mongoose');

// Schema cho đánh giá sản phẩm
const productReviewSchema = new mongoose.Schema({
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  idProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  idOrderDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderDetail', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, trim: true, maxlength: 1000 },
  adminReplies: [
    {
      content: { type: String, trim: true, maxlength: 1000 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    }
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tạo index ghép cho idUser, idProduct, idOrderDetail
productReviewSchema.index({ idUser: 1, idProduct: 1, idOrderDetail: 1 }, { unique: true });

// Cập nhật updated_at khi sửa
productReviewSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('ProductReview', productReviewSchema);