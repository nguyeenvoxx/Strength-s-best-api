const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

exports.sendWelcomeEmail = async (to, username, voucherCode) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background:rgb(97, 255, 79); color: #fff; padding: 24px 16px; text-align: center;">
        <h2>Chào mừng ${username} đến với <span style="color: #ffd700;">Strength Best</span>!</h2>
      </div>
      <div style="padding: 24px 16px;">
        <p>Cảm ơn bạn đã đăng ký tài khoản. Dưới đây là mã voucher giảm giá dành riêng cho bạn:</p>
        <div style="background: #f5f5f5; border-radius: 6px; padding: 16px; text-align: center; margin: 16px 0;">
          <span style="font-size: 1.5em; font-weight: bold; color:rgb(82, 255, 79);">${voucherCode}</span>
          <div style="margin-top: 8px; color: #333;">
            <b>Đơn tối thiểu:</b> 0&nbsp;&nbsp;|&nbsp;&nbsp;
            <b>Giảm tối đa:</b> 30%&nbsp;&nbsp;|&nbsp;&nbsp;
            <b>Số lần/user:</b> 1
          </div>
        </div>
        <p>Hãy sử dụng mã này khi mua hàng để nhận ưu đãi!</p>
        <p style="margin-top: 24px;">Chúc bạn trải nghiệm mua sắm vui vẻ!<br/>Strength Best Team</p>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: 'Strength Best <your_gmail@gmail.com>',
    to,
    subject: 'Chào mừng bạn đến với Strength Best - Nhận ngay voucher giảm giá!',
    html,
  });
};

exports.sendResetPasswordEmail = async (to, resetLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background:rgb(111, 255, 79); color: #fff; padding: 24px 16px; text-align: center;">
        <h2>Yêu cầu đổi mật khẩu</h2>
      </div>
      <div style="padding: 24px 16px;">
        <p>Bạn vừa yêu cầu đổi mật khẩu cho tài khoản tại <b>Strength Best</b>.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background:rgb(158, 255, 79); color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Đặt lại mật khẩu</a>
        </div>
        <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
        <p style="margin-top: 24px;">Strength Best Team</p>
      </div>
    </div>
  `;
  await transporter.sendMail({
    from: 'Strength Best <your_gmail@gmail.com>',
    to,
    subject: 'Yêu cầu đổi mật khẩu - Strength Best',
    html,
  });
}; 