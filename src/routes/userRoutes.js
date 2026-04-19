import { Router } from "express";
import {
  signup,
  verifyEmail,
  resendOtp,
  userLogin,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";
import { getUser } from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";

const router = Router();

router.post("/register", signup);
router.post("/verifyEmail", verifyEmail);
router.post("/resendOtp", resendOtp);
router.post("/login", userLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/update-profile", auth(), updateProfile);
router.put("/change-password", auth(), changePassword);

// Single /user/:id route — uses getUser from authController
router.get("/user/:id", auth(), getUser);

// Pharmacy saves its GPS location to DB for delivery purposes
router.put("/update-location", auth(), async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    if (latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ message: "latitude and longitude are required" });
    }
    await User.findByIdAndUpdate(req.user._id, {
      "location.latitude": Number(latitude),
      "location.longitude": Number(longitude),
      "location.address": address ?? "",
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;