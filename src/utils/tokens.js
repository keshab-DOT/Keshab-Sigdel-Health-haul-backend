import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const createJWT = (user) => {
  return jwt.sign({ _id: user._id, email: user.email, roles: user.roles }, config.jwtSecret, { expiresIn: "1d" });
};

// OTP generator
export const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
export default { createJWT, generateVerificationCode };