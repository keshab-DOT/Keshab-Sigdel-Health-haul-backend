import { Router } from "express";
import { signup, verifyEmail, resendOtp, userLogin, logout } from "../controllers/userController.js";


const router = Router();

router.post("/register", signup);
router.post("/verifyEmail", verifyEmail);
router.post("/resendOtp", resendOtp);
router.post("/login", userLogin);
router.post("/logout", logout);

export default router;
