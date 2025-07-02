const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema cho người dùng
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Người dùng phải có tên'],
    trim: true,
    maxlength: [50, 'Tên không được vượt quá 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng cung cấp email hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
    select: false
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?([0-9]{9,15})$/, 'Vui lòng cung cấp số điện thoại hợp lệ']
  },
  address: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'active', 'inactive', 'banned'], default: 'pending' },
  avatarUrl: { type: String, trim: true, default: null },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetToken: { type: String, default: null },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Tạo index cho email và role
userSchema.index({ email: 1, role: 1 });

// Hash mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  this.updatedAt = Date.now(); // Cập nhật updatedAt khi tạo mới
  next();
});

// Tạo token xác minh email
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.emailVerified) {
    this.verificationToken = this._id.toString() + Math.random().toString(36).substr(2, 9);
  }
  next();
});

// Cập nhật updatedAt khi sửa
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);