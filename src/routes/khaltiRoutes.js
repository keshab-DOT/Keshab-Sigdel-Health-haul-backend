import express from "express";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "../controllers/khalticontroller.js";
import auth         from "../middleware/authMiddleware.js";
import roleBasedAuth from "../middleware/rolebased.js";
import { USER }     from "../constants/roles.js";

const router = express.Router();

router.post("/initiate", auth(), roleBasedAuth([USER]), initiateKhaltiPayment);
router.post("/verify", auth(), verifyKhaltiPayment);

export default router;