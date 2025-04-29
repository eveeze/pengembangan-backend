// routes/transactionRoutes.js
import express from "express";
import * as transactionController from "../controllers/transactionController.js";
import { createTransactionValidation } from "../middlewares/validation/transactionValidation.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.post("/", createTransactionValidation, transactionController.createTransaction);
router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionById);
router.delete("/:id", transactionController.deleteTransaction);

export default router;
