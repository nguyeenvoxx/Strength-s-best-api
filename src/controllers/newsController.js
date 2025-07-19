const News = require('../models/news');

// Tạo tin tức mới
exports.createNews = async (req, res) => {
  const { title, content } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = `/uploads/news/${req.file.filename}`;
  }
  const news = await News.create({
    title,
    content,
    image,
    createdBy: req.user ? req.user._id : null
  });
  res.status(201).json(news);
};

// Lấy danh sách tin tức
exports.getAllNews = async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
};

// Lấy chi tiết tin tức
exports.getNewsById = async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return res.status(404).json({ message: 'Không tìm thấy tin tức' });
  res.json(news);
};

// Sửa tin tức
exports.updateNews = async (req, res) => {
  const { title, content } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = `/uploads/news/${req.file.filename}`;
  }
  const news = await News.findByIdAndUpdate(
    req.params.id,
    { title, content, image },
    { new: true }
  );
  if (!news) return res.status(404).json({ message: 'Không tìm thấy tin tức' });
  res.json(news);
};

// Xóa tin tức
exports.deleteNews = async (req, res) => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (!news) return res.status(404).json({ message: 'Không tìm thấy tin tức' });
  res.json({ message: 'Đã xóa tin tức' });
};