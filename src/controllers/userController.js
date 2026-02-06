import userService from "../services/userService.js";
import { createJWT } from "../utils/tokens.js";

const signup = async (req, res) => {
  try {
    const input = req.body;
    if (!input.password || !input.confirmPassword)
      return res.status(400).json({ message: "Password and Confirm Password are required" });

    if (input.password !== input.confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await userService.signup(input);

    res.status(201).json({
      message: "User registered successfully. Check your email for verification code.",
      user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const result = await userService.verifyEmail(email, verificationCode);

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Server error" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await userService.resendOtp(email);

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Server error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const input = req.body;
    const user = await userService.login(input);
    const authToken = createJWT(user);

    res.cookie("authToken", authToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("authToken", { httpOnly: true, sameSite: "strict" });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

export { signup, verifyEmail, resendOtp, userLogin, logout };
