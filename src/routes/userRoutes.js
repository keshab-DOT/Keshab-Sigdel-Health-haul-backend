import { Router } from "express";
import { signup, verifyEmail, resendOtp, userLogin, logout,
   forgotPassword, resetPassword, updateProfile, changePassword, } 
   from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";

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

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name location roles");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// pharmacy saves its GPS location to DB for delivery purposes
router.put("/update-location", auth(), async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: "latitude and longitude are required" });
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