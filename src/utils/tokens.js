import jwt from "jsonwebtoken";
import config from "../config/config.js";

// Create JWT
export const createJWT = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      roles: user.roles, // always keep this as array or string consistently
    },
    config.jwtSecret,
    { expiresIn: "1d" }
  );
};

// Verify JWT
export const verifyJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded; // ✅ always return decoded payload
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// OTP generator
export const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
