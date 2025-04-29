// middlewares/validation/transactionValidation.js
import { body } from "express-validator";

export const createTransactionValidation = [
  body("totalAmount").notEmpty().withMessage("Total Amount wajib diisi").isFloat({ gt: 0 }).withMessage("Total Amount harus lebih dari 0"),
  body("paymentMethod").notEmpty().withMessage("Payment Method wajib diisi"),
  body("diskon").optional().isFloat({ min: 0 }).withMessage("Diskon harus lebih dari atau sama dengan 0"),
  body("items").isArray({ min: 1 }).withMessage("Items harus berupa array dan minimal 1 item"),
  body("items.*.productId").notEmpty().withMessage("Product ID wajib diisi di setiap item"),
  body("items.*.sizeId").notEmpty().withMessage("Size ID wajib diisi di setiap item"),
  body("items.*.quantity").isInt({ gt: 0 }).withMessage("Quantity harus lebih dari 0 di setiap item"),
  body("items.*.hargaJual").isFloat({ gt: 0 }).withMessage("Harga Jual harus lebih dari 0 di setiap item"),
  body("items.*.hargaBeli").isFloat({ gt: 0 }).withMessage("Harga Beli harus lebih dari 0 di setiap item"),
];
