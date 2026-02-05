import { Router } from "express";
import {  deleteUser, getAllUsers, singleUser, updateUser, userLogin, userProfile, userRegistration } from "../controllers/userController.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";


const router=Router();

router.route("/register").post(userRegistration);
router.route("/login").post(userLogin);


router.route("/getAll").get(isAuthenticated, restrictTo(Role.Admin) , getAllUsers);
router.route("/profile").get(isAuthenticated , userProfile);
router.route("/singleUser/:id").get(isAuthenticated , singleUser);


router.route("/updateUser/:id").patch(isAuthenticated , updateUser);


router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), deleteUser);


export default router