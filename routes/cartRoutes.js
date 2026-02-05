import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { addToCart, deleteCartItem, getCartItem, updateCartItem } from "../controllers/cartController.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";

const router=Router();

router.route("/").post(isAuthenticated,restrictTo(Role.User), errorHandle(addToCart))
.get(isAuthenticated, errorHandle(getCartItem))

router.route("/").patch(isAuthenticated, errorHandle(updateCartItem) )
router.route("/:productId").delete(isAuthenticated, deleteCartItem)


export default  router