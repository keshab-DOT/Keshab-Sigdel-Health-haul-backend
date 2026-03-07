import jwt from "jsonwebtoken";
import config from "../config/config.js";

// Create JWT
export const createJWT = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      roles: user.roles, 
    },
    config.jwtSecret,
    { expiresIn: "1d" }
  );
};

// Verify JWT
export const verifyJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded; 
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
