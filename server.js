// ----- IMPORT THƯ VIỆN -----
const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Thêm require cors

// ----- KHỞI TẠO ỨNG DỤNG EXPRESS -----
const app = express();

// ----- MIDDLEWARE -----
app.use(express.json()); // Để đọc JSON body
app.use(cors());         // <<< Sử dụng cors middleware - Đã sửa lỗi thiếu

// ----- CẤU HÌNH CỔNG -----
const PORT = 3000;

// ----- KẾT NỐI CƠ SỞ DỮ LIỆU MONGODB -----
const dbURI = 'mongodb://localhost:27017/my-auth-db'; // Đảm bảo chuỗi này đúng

// --- Định nghĩa Schema và Model cho User ---
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Kết nối đến MongoDB và khởi động server sau khi thành công
mongoose.connect(dbURI)
  .then(() => {
    console.log('Đã kết nối thành công đến MongoDB');
    app.listen(PORT, () => {
      console.log(`Server đang lắng nghe tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1); // Thoát nếu không kết nối được DB
  });

// ----- ĐỊNH NGHĨA ROUTES -----

// Route GET / (Để kiểm tra server chạy)
app.get('/', (req, res) => {
  res.send('Server Express cơ bản đang chạy!');
});

// Route POST /api/register (API Đăng ký)
app.post('/api/register', async (req, res) => {
  console.log('Yêu cầu đến /api/register');
  const { email, password } = req.body;
  console.log('Dữ liệu nhận được:', { email, password: '********' });

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log(`Email ${email} đã tồn tại.`);
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    console.log(`Email ${email} chưa tồn tại. Đang hash mật khẩu...`);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Đã hash mật khẩu thành công.');

    console.log(`Đang tạo người dùng mới với mật khẩu đã hash...`);
    const newUser = new User({
      email: email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    console.log('Đã lưu người dùng mới (với mật khẩu đã hash):', { ...savedUser.toObject(), password: '*** HASHED ***'});

    res.status(201).json({
      message: 'Đăng ký thành công!',
      userId: savedUser._id
    });

  } catch (error) {
    console.error('Lỗi trong quá trình đăng ký:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra trên server khi đăng ký' });
  }
}); // <<< KẾT THÚC /api/register

// Route POST /api/login (API Đăng nhập) <<<< Đặt đúng vị trí
app.post('/api/login', async (req, res) => {
  console.log('Yêu cầu đến /api/login');
  const { email, password } = req.body;
  console.log('Dữ liệu nhận được:', { email, password: '********' });

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      console.log(`Đăng nhập thất bại: Không tìm thấy email ${email}`);
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    console.log(`Tìm thấy người dùng: ${email}. Đang so sánh mật khẩu...`);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Đăng nhập thất bại: Mật khẩu không khớp cho email ${email}`);
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }

    console.log(`Đăng nhập thành công cho email ${email}`);
    // !!! CHỖ NÀY SẼ THAY BẰNG TẠO JWT SAU !!!
    res.status(200).json({
       message: 'Đăng nhập thành công! (Chưa tạo token)',
       userId: user._id
     });

  } catch (error) {
    console.error('Lỗi trong quá trình đăng nhập:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra trên server khi đăng nhập' });
  }
}); // <<< KẾT THÚC /api/login

// ----- KẾT THÚC PHẦN ĐỊNH NGHĨA ROUTES -----