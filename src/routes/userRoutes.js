import { Router } from "express";
import { signup, verifyEmail, resendOtp, userLogin, logout, forgotPassword, resetPassword,   updateProfile, changePassword, } from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", signup);
router.post("/verifyEmail", verifyEmail);
router.post("/resendOtp", resendOtp);
router.post("/login", userLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword); 
router.put("/update-profile",   auth(), updateProfile);
router.put("/change-password",  auth(), changePassword);    

export default router;