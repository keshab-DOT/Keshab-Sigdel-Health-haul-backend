import { Router } from "express";
import { signup, verifyEmail, resendOtp, userLogin, logout, resetPassword } from "../controllers/userController.js";


const router = Router();

router.post("/register", signup);
router.post("/verifyEmail", verifyEmail);
router.post("/resendOtp", resendOtp);
router.post("/login", userLogin);
router.post("/logout", logout);
router.post("/resetPassword", resetPassword);

export default router;
