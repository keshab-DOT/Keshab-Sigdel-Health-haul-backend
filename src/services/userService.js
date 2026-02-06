import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/tokens.js"; // OTP can be here or Email.js
import { sendVerificationCode } from "./emailService.js";

const OTP_EXPIRY_MINUTES = 5;

const signup = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw { statusCode: 409, message: "User already exists" };

  const hashedPassword = bcrypt.hashSync(data.password, 10);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpiryTime = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  const signupUser = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    isVerified: false,
    verificationCode,
    verificationCodeExpiryTime,
  });

  await sendVerificationCode(signupUser.email, verificationCode);

  return {
    _id: signupUser._id,
    name: signupUser.name,
    email: signupUser.email,
    phone: signupUser.phone,
    roles: signupUser.roles,
    message: "User created. Check your email for verification code",
  };
};

const verifyEmail = async (email, code) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };
  if (user.isVerified) throw { statusCode: 400, message: "User already verified" };
  if (!user.verificationCode) throw { statusCode: 400, message: "Verification code missing" };
  if (user.verificationCodeExpiryTime < Date.now()) throw { statusCode: 400, message: "Verification code expired" };
  if (user.verificationCode.toString().trim() !== code.toString().trim()) throw { statusCode: 400, message: "Invalid verification code" };

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpiryTime = null;
  await user.save();

  return { message: "Email verified successfully" };
};

const resendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };
  if (user.isVerified) throw { statusCode: 400, message: "User already verified" };

  const verificationCode = generateVerificationCode();
  user.verificationCode = verificationCode;
  user.verificationCodeExpiryTime = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  await user.save();
  await sendVerificationCode(user.email, verificationCode);

  return { message: "Verification code resent successfully" };
};

const login = async (data) => {
  const user = await User.findOne({ email: data.email });
  if (!user) throw { statusCode: 404, message: "User not found" };
  if (!user.isVerified) throw { statusCode: 401, message: "Please verify your email before logging in" };

  const isMatch = bcrypt.compareSync(data.password, user.password);
  if (!isMatch) throw { statusCode: 401, message: "Invalid email or password" };

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
  };
};

export default { signup, verifyEmail, login, resendOtp };
