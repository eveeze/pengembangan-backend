// routes/productRoutes.js
import express from "express";
import * as productController from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../middlewares/validation/productValidation.js";
import { uploadProduct } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

router.use(authMiddleware.verifyToken);

router.post(
  "/",
  uploadProduct.single("image"),
  validateCreateProduct,
  productController.createProduct
);

router.put(
  "/:id",
  uploadProduct.single("image"),
  validateUpdateProduct,
  productController.updateProduct
);

router.delete("/:id", productController.deleteProduct);

export default router;