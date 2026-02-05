import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { cancleOrder, createOrder, deleteOrder, getAllOrders, getMyOrder, getSingleOrder, updateOrderStatus } from "../controllers/orderController.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { verifyTransactions } from "../controllers/paymentController.js";

const router=Router();
router.route("/").post(isAuthenticated, restrictTo(Role.User),createOrder)
.get(isAuthenticated,restrictTo(Role.Admin), errorHandle(getAllOrders))

router.route("/myOrders").get(isAuthenticated,restrictTo(Role.User), errorHandle(getMyOrder))

router.route("/:id").get( isAuthenticated, errorHandle(getSingleOrder))
.post(isAuthenticated,restrictTo(Role.User) ,errorHandle(cancleOrder))
.patch(isAuthenticated, restrictTo(Role.Admin), updateOrderStatus)

.delete(isAuthenticated,restrictTo(Role.Admin) ,errorHandle(deleteOrder))

router.route("/payment/verify").post(isAuthenticated, verifyTransactions)


export default router