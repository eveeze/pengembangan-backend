// middlewares/validation/productValidation.js
import { body } from "express-validator";

export const validateCreateProduct = [
  body("nama").notEmpty().withMessage("Nama produk wajib diisi"),
  body("hargaBeli").isFloat({ gt: 0 }).withMessage("Harga beli harus lebih dari 0"),
  body("hargaJual").isFloat({ gt: 0 }).withMessage("Harga jual harus lebih dari 0"),
  body("categoryId").notEmpty().withMessage("Kategori wajib diisi"),
  body("brandId").notEmpty().withMessage("Merek wajib diisi"),
  body("productTypeId").notEmpty().withMessage("Tipe produk wajib diisi"),
];

export const validateUpdateProduct = [
  ...validateCreateProduct,
];