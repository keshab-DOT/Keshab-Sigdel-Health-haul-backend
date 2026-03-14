import { Router } from "express";
import { signup, verifyEmail, resendOtp, userLogin, logout, forgotPassword, resetPassword } from "../controllers/userController.js";

const router = Router();

router.post("/register", signup);
router.post("/verifyEmail", verifyEmail);
router.post("/resendOtp", resendOtp);
router.post("/login", userLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword);     

export default router;