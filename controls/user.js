const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || "SECRETTOKEN";

const cookieOptions = {

  httpOnly: true,
  expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/"
};

const registerUser = async (req, res) => {

  try {

    const { name, email, phone, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {

      return res.status(400).json({ message: "Bu kullanıcı zaten kayıtlı." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, phone, password: passwordHash });
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "5d" });

    res.status(201).cookie("token", token, cookieOptions).json({ success: true, user: newUser, token });

  } catch (error) {

    console.error("REGISTER HATASI:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {

      return res.status(401).json({ message: "E-posta veya şifre hatalı." });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {

      return res.status(401).json({ message: "E-posta veya şifre hatalı." });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "5d" });
    user.password = undefined;
    res.status(200).cookie("token", token, cookieOptions).json({ success: true, user, token });

  } catch (error) {

    console.error("LOGIN HATASI:", error.message);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};

const forgotPassword = async (req, res) => {

  try {

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const passwordUrl = `${req.protocol}://${req.get('host')}/reset/${resetToken}`;

    const transporter = nodemailer.createTransport({

      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: { user: '4b76e592f932f7', pass: '9a15c6c399a6f7' }
    });

    await transporter.sendMail({

      from: 'noreply@smarthome.com',
      to: user.email,
      subject: 'Şifre Sıfırlama İsteği',
      html: `<h3>Şifrenizi sıfırlamak için <a href="${passwordUrl}">buraya tıklayın</a></h3>`
    });

    res.status(200).json({ success: true, message: "Sıfırlama maili gönderildi." });

  } catch (error) {

    console.error("FORGOT PASSWORD HATASI:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {

  try {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({

      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Geçersiz veya süresi dolmuş token." });
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "5d" });
    user.password = undefined;
    res.status(200).cookie("token", token, cookieOptions).json({ success: true, user, token });

  } catch (error) {

    console.error("RESET PASSWORD HATASI:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    res.status(200).json({ success: true, user });
  } catch (error) {

    console.error("GET PROFILE HATASI:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {

  res.status(200).cookie("token", null, {

    expires: new Date(Date.now()),
    httpOnly: true
  }).json({ success: true, message: "Çıkış başarılı." });
};

const addHome = async (req, res) => {

  try {

    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    user.homes.push({ name, rooms: [] });
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const deleteHome = async (req, res) => {

  try {

    const user = await User.findById(req.user.id);
    const { homeId } = req.params;
    const home = user.homes.id(homeId);
    if (!home) return res.status(404).json({ message: "Ev bulunamadı." });    
    home.deleteOne();
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const addRoom = async (req, res) => {

  try {

    const { homeId, roomName } = req.body;
    const user = await User.findById(req.user.id);
    const home = user.homes.id(homeId);
    if (!home) return res.status(404).json({ message: "Ev bulunamadı." });
    home.rooms.push({ name: roomName, devices: [] });
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {

  try {

    const { homeId, roomId } = req.body;
    const user = await User.findById(req.user.id);
    const home = user.homes.id(homeId);
    if (!home) return res.status(404).json({ message: "Ev bulunamadı." });
    const room = home.rooms.id(roomId);
    if (!room) return res.status(404).json({ message: "Oda bulunamadı." });
    room.deleteOne();
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getProfile, logout, addHome, deleteHome, addRoom, deleteRoom };