// Hàm tiện ích để xử lý lỗi bất đồng bộ
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};

module.exports = catchAsync;