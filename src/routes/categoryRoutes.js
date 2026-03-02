import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import auth from "../middleware/authMiddleware.js";
import roleBasedAuth from "../middleware/rolebased.js";
import { ADMIN } from "../constants/roles.js";
import { multer, storage } from "../middleware/multerMiddleware.js";
import {
    createCategory,
    deleteCategory,
    fetchSingleCategory,
    getAllCategory,
    updateCategory,
} from "../controllers/categoryController.js";

const router = Router();
const upload = multer({ storage });

router
    .route("/")
    .post(auth(), roleBasedAuth([ADMIN]), upload.single("image"), errorHandle(createCategory))
    .get(getAllCategory);

router
    .route("/:id")
    .get(errorHandle(fetchSingleCategory))
    .patch(auth(), roleBasedAuth([ADMIN]), upload.single("image"), errorHandle(updateCategory))
    .delete(auth(), roleBasedAuth([ADMIN]), errorHandle(deleteCategory));

export default router;