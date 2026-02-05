import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { createCategory, deleteCategory, fetchSingleCategory, getAllCategory, updateCategory } from "../controllers/categoryController.js";
import {multer, storage} from "../middleware/multerMiddleware.js"
const router=Router();

const upload=multer({storage : storage});


router.route("/").post(isAuthenticated, restrictTo(Role.Admin),upload.single('image'), errorHandle(createCategory))
.get(getAllCategory)

router.route("/:id").get(errorHandle(fetchSingleCategory))
.patch(isAuthenticated, restrictTo(Role.Admin), errorHandle(updateCategory))
.delete(isAuthenticated, restrictTo(Role.Admin), errorHandle(deleteCategory))

export default router;