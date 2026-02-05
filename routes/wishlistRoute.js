import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { addToWishList, getWishlist, removeProductFromWhishlist } from "../controllers/wishlistController.js";

const router=Router();

router.route("/").post(isAuthenticated,restrictTo(Role.User) ,errorHandle(addToWishList))
.get(isAuthenticated,restrictTo(Role.User), errorHandle(getWishlist))
.patch(isAuthenticated, restrictTo(Role.User), removeProductFromWhishlist) 


export default  router