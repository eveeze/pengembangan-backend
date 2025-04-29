// middlewares/validation/customerValidation.js
import { body } from "express-validator";

export const createCustomerValidation = [
  body("nama").notEmpty().withMessage("Nama tidak boleh kosong"),
  body("email").optional().isEmail().withMessage("Format email tidak valid"),
  body("phone").optional().isString().withMessage("Nomor telepon tidak valid"),
  body("alamat").optional().isString().withMessage("Alamat tidak valid"),
];

export const updateCustomerValidation = [
  body("nama").optional().isString().withMessage("Nama harus berupa teks"),
  body("email").optional().isEmail().withMessage("Format email tidak valid"),
  body("phone").optional().isString().withMessage("Nomor telepon tidak valid"),
  body("alamat").optional().isString().withMessage("Alamat tidak valid"),
];
