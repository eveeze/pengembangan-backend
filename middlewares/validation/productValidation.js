// middlewares/validation/productValidation.js
import { body } from "express-validator";

export const validateCreateProduct = [
  body("nama").notEmpty().withMessage("Nama produk wajib diisi"),
  body("hargaBeli").isFloat({ gt: 0 }).withMessage("Harga beli harus lebih dari 0"),
  body("hargaJual").isFloat({ gt: 0 }).withMessage("Harga jual harus lebih dari 0"),
  body("categoryId").notEmpty().withMessage("Kategori wajib diisi"),
  body("brandId").notEmpty().withMessage("Merek wajib diisi"),
  body("productTypeId").notEmpty().withMessage("Tipe produk wajib diisi"),
  body("kondisi").optional().isIn(["BARU", "BEKAS", "REKONDISI"]),
  body("stockBatchId").optional().isUUID().withMessage("StockBatch ID tidak valid"),
  body("sizes").optional().isArray(),
  body("sizes.*.sizeId").isUUID().withMessage("Size ID tidak valid"),
  body("sizes.*.quantity").isInt({ min: 0 }).withMessage("Quantity harus bilangan bulat positif"),
];

export const validateUpdateProduct = [
  body("nama").optional().notEmpty().withMessage("Nama produk wajib diisi"),
  body("hargaBeli").optional().isFloat({ gt: 0 }),
  body("hargaJual").optional().isFloat({ gt: 0 }),
  body("categoryId").optional().notEmpty(),
  body("brandId").optional().notEmpty(),
  body("productTypeId").optional().notEmpty(),
  body("minStock").optional().isInt({ gt: -1 }),
  body("kondisi").optional().isIn(["BARU", "BEKAS", "REKONDISI"]),
  body("stockBatchId").optional().isUUID(),
  body("sizes").optional().isArray(),
  body("sizes.*.sizeId").optional().isUUID(),
  body("sizes.*.quantity").optional().isInt({ min: 0 }),
];