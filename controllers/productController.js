// controllers/productController.js
import { validationResult } from "express-validator";
import * as productRepository from "../repositories/productRepository.js";
import { deleteImage } from "../utils/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const result = await productRepository.getAllProducts({ search, limit, page });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan daftar produk",
      ...result,
    });
  } catch (error) {
    console.error("Error getAllProducts:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil produk" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productRepository.getProductById(id);
    if (!product) return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan detail produk",
      data: product,
    });
  } catch (error) {
    console.error("Error getProductById:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil detail produk" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: "error", message: "Validasi gagal", errors: errors.array() });

    const { nama, deskripsi, hargaBeli, hargaJual, categoryId, brandId, productTypeId, minStock = 0, kondisi = "BARU" } = req.body;
    const image = req.file?.path;

    const nameExists = await productRepository.isProductNameExists(nama);
    if (nameExists) return res.status(400).json({ status: "error", message: "Nama produk sudah digunakan" });

    const product = await productRepository.createProduct({ nama, deskripsi, hargaBeli: parseFloat(hargaBeli), hargaJual: parseFloat(hargaJual), categoryId: parseInt(categoryId), brandId: parseInt(brandId), productTypeId, image, minStock: parseInt(minStock), kondisi });

    return res.status(201).json({
      status: "success",
      message: "Produk berhasil ditambahkan",
      data: product,
    });
  } catch (error) {
    console.error("Error createProduct:", error);
    return res.status(500).json({ status: "error", message: "Gagal menambahkan produk" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: "error", message: "Validasi gagal", errors: errors.array() });

    const { id } = req.params;
    const existing = await productRepository.getProductById(id);
    if (!existing) return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });

    if (req.file?.path && existing.image) await deleteImage(existing.image);

    const updated = await productRepository.updateProduct(id, {
      ...req.body,
      image: req.file?.path || existing.image,
    });

    return res.status(200).json({ status: "success", message: "Produk berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("Error updateProduct:", error);
    return res.status(500).json({ status: "error", message: "Gagal memperbarui produk" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await productRepository.getProductById(id);
    if (!existing) return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });

    if (existing.image) await deleteImage(existing.image);
    await productRepository.deleteProduct(id);

    return res.status(200).json({ status: "success", message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteProduct:", error);
    return res.status(500).json({ status: "error", message: "Gagal menghapus produk" });
  }
};
