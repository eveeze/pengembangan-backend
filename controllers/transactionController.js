// controllers/transactionController.js
import * as transactionRepository from "../repositories/transactionRepository.js";
import { validationResult } from "express-validator";

export const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "error", errors: errors.array() });
    }

    const userId = req.user.id; // ambil user ID dari token
    const { customerId, totalAmount, paymentMethod, diskon, catatan, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ status: "error", message: "Items tidak boleh kosong" });
    }

    const transaction = await transactionRepository.createTransaction({
      customerId,
      totalAmount,
      paymentMethod,
      diskon,
      catatan,
      userId,
      items,
    });

    return res.status(201).json({
      status: "success",
      message: "Transaksi berhasil dibuat",
      data: transaction,
    });
  } catch (error) {
    console.error("Error createTransaction:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat membuat transaksi",
    });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionRepository.getAllTransactions();

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil semua transaksi",
      data: transactions,
    });
  } catch (error) {
    console.error("Error getAllTransactions:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data transaksi",
    });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await transactionRepository.getTransactionById(id);

    if (!transaction) {
      return res.status(404).json({ status: "error", message: "Transaksi tidak ditemukan" });
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil detail transaksi",
      data: transaction,
    });
  } catch (error) {
    console.error("Error getTransactionById:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil detail transaksi",
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await transactionRepository.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ status: "error", message: "Transaksi tidak ditemukan" });
    }

    await transactionRepository.deleteTransaction(id);

    return res.status(200).json({
      status: "success",
      message: "Transaksi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleteTransaction:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus transaksi",
    });
  }
};
