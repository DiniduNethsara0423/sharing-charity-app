const { Otp, User } = require('../models');
const { sendMail } = require('./mailService');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MIN || '10', 10);

const generateCode = () => {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
};

const generateAndSendOtp = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

  await Otp.create({ email, user_id: user.user_id, code, expires_at: expiresAt, used: false });

  const subject = 'Your OTP code';
  const text = `Your OTP code is ${code}. It expires in ${OTP_TTL_MIN} minutes.`;

  await sendMail({ to: email, subject, text });
  return { ok: true };
};

const verifyOtp = async (email, code) => {
  const now = new Date();
  const otp = await Otp.findOne({
    where: { email, code, used: false, expires_at: { [Op.gt]: now } },
    order: [['createdAt', 'DESC']],
  });
  if (!otp) return null;
  otp.used = true;
  await otp.save();

  // issue a short-lived reset token
  const resetToken = jwt.sign({ email, purpose: 'reset' }, JWT_SECRET, { expiresIn: '15m' });
  return { resetToken };
};

module.exports = { generateAndSendOtp, verifyOtp };
