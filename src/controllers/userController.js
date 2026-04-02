import userService from "../services/userService.js";
import { createJWT } from "../utils/tokens.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

const signup = async (req, res) => {
  try {
    const input = req.body;
    if (!input.password || !input.confirmPassword)
      return res.status(400).json({ message: "Password and Confirm Password are required" });
    if (input.password !== input.confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    // userService.signup handles saving user + sending email internally
    // We need to ensure email failure doesn't crash this endpoint
    let user;
    try {
      user = await userService.signup(input);
    } catch (serviceError) {
      // If it's a known error (e.g. user exists), pass it through
      if (serviceError.statusCode) {
        return res.status(serviceError.statusCode).json({ message: serviceError.message });
      }
      // Otherwise it might be an email/network error — check if user was created
      // by looking up the email
      const existingUser = await User.findOne({ email: input.email }).select("-password");
      if (existingUser) {
        // User was saved but email failed — return success anyway
        console.error("Email sending failed (non-fatal):", serviceError.message);
        return res.status(201).json({
          message: "User registered successfully. Email verification may be delayed.",
          user: existingUser,
        });
      }
      // User wasn't saved either — real error
      throw serviceError;
    }

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
      secure: process.env.NODE_ENV === "production", // ← secure in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ← "none" needed for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user, token: authToken });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const result = await userService.forgotPassword(email);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: "New Password and Confirm Password are required" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    const result = await userService.resetPassword(email, code, newPassword);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, address, licenseNumber, description } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ message: "Name is required" });

    const updates = { name: name.trim() };
    if (phone !== undefined)         updates.phone         = phone;
    if (address !== undefined)       updates.address       = address;
    if (licenseNumber !== undefined) updates.licenseNumber = licenseNumber;
    if (description !== undefined)   updates.description   = description;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -verificationCode -verificationCodeExpiryTime -resetPasswordCode -resetPasswordExpiryTime");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All password fields are required" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "New passwords do not match" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export {
  signup,
  verifyEmail,
  resendOtp,
  userLogin,
  forgotPassword,
  resetPassword,
  logout,
  updateProfile,
  changePassword,
};