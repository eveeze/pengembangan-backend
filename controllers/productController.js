// controllers/productController.js
import { validationResult } from "express-validator";
import * as productRepository from "../repositories/productRepository.js";
import * as productSizeRepository from "../repositories/productSizeRepository.js";
import { deleteImage } from "../utils/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const result = await productRepository.getAllProducts({
      search,
      limit,
      page,
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan daftar produk",
      ...result,
    });
  } catch (error) {
    console.error("Error getAllProducts:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil produk" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productRepository.getProductById(id);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan detail produk",
      data: product,
    });
  } catch (error) {
    console.error("Error getProductById:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal mengambil detail produk" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({
          status: "error",
          message: "Validasi gagal",
          errors: errors.array(),
        });

    const {
      nama,
      deskripsi,
      hargaBeli,
      hargaJual,
      categoryId,
      brandId,
      productTypeId,
      minStock = 0,
      kondisi = "BARU",
      stockBatchId,
      sizes = [],
    } = req.body;
    const image = req.file?.path;

    const nameExists = await productRepository.isProductNameExists(nama);
    if (nameExists)
      return res
        .status(400)
        .json({ status: "error", message: "Nama produk sudah digunakan" });

    const product = await productRepository.createProduct({
      nama,
      deskripsi,
      hargaBeli: parseFloat(hargaBeli),
      hargaJual: parseFloat(hargaJual),
      categoryId: parseInt(categoryId),
      brandId: parseInt(brandId),
      productTypeId,
      image,
      minStock: parseInt(minStock),
      kondisi,
      stockBatchId,
      sizes: sizes.map((s) => ({
        sizeId: s.sizeId,
        quantity: parseInt(s.quantity) || 0,
      })),
    });

    return res.status(201).json({
      status: "success",
      message: "Produk berhasil ditambahkan",
      data: product,
    });
  } catch (error) {
    console.error("Error createProduct:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menambahkan produk" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({
          status: "error",
          message: "Validasi gagal",
          errors: errors.array(),
        });

    const { id } = req.params;
    const existing = await productRepository.getProductById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });

    const {
      nama = existing.nama,
      deskripsi = existing.deskripsi,
      hargaBeli = existing.hargaBeli,
      hargaJual = existing.hargaJual,
      categoryId = existing.categoryId,
      brandId = existing.brandId,
      productTypeId = existing.productTypeId,
      minStock = existing.minStock,
      kondisi = existing.kondisi,
      stockBatchId = existing.stockBatchId,
      sizes = [], // Perhatikan: jika sizes disediakan, kita akan memperbarui semua ukuran
    } = req.body;

    const image = req.file?.path || existing.image;
    if (req.file?.path && existing.image) await deleteImage(existing.image);

    // Periksa apakah nama produk sudah digunakan (kecuali oleh produk ini sendiri)
    if (nama !== existing.nama) {
      const nameExists = await productRepository.isProductNameExists(nama, id);
      if (nameExists)
        return res
          .status(400)
          .json({ status: "error", message: "Nama produk sudah digunakan" });
    }

    const updated = await productRepository.updateProduct(id, {
      nama,
      deskripsi,
      hargaBeli: parseFloat(hargaBeli),
      hargaJual: parseFloat(hargaJual),
      categoryId: parseInt(categoryId),
      brandId: parseInt(brandId),
      productTypeId,
      image,
      minStock: parseInt(minStock),
      kondisi,
      stockBatchId,
      sizes:
        sizes.length > 0
          ? sizes.map((s) => ({
              sizeId: s.sizeId,
              quantity: parseInt(s.quantity) || 0,
            }))
          : undefined,
    });

    return res
      .status(200)
      .json({
        status: "success",
        message: "Produk berhasil diperbarui",
        data: updated,
      });
  } catch (error) {
    console.error("Error updateProduct:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal memperbarui produk" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await productRepository.getProductById(id);
    if (!existing)
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });

    if (existing.image) await deleteImage(existing.image);
    await productRepository.deleteProduct(id);

    return res
      .status(200)
      .json({ status: "success", message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteProduct:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menghapus produk" });
  }
};

// Fungsi tambahan untuk manajemen stok dan ukuran

export const getLowStockProducts = async (req, res) => {
  try {
    const products = await productRepository.getLowStockProducts();
    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan daftar produk dengan stok rendah",
      data: products,
    });
  } catch (error) {
    console.error("Error getLowStockProducts:", error);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Gagal mengambil produk dengan stok rendah",
      });
  }
};

export const addProductSize = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({
          status: "error",
          message: "Validasi gagal",
          errors: errors.array(),
        });

    const { id } = req.params;
    const { sizeId, quantity } = req.body;

    // Cek apakah produk ada
    const product = await productRepository.getProductById(id);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });

    // Cek apakah kombinasi produk-ukuran sudah ada
    const exists = await productSizeRepository.isProductSizeExists(id, sizeId);
    if (exists)
      return res
        .status(400)
        .json({
          status: "error",
          message: "Ukuran sudah ada untuk produk ini",
        });

    const result = await productSizeRepository.createProductSize({
      productId: id,
      sizeId,
      quantity: parseInt(quantity) || 0,
    });

    return res.status(201).json({
      status: "success",
      message: "Ukuran produk berhasil ditambahkan",
      data: result,
    });
  } catch (error) {
    console.error("Error addProductSize:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menambahkan ukuran produk" });
  }
};

export const updateProductSize = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({
          status: "error",
          message: "Validasi gagal",
          errors: errors.array(),
        });

    const { id, sizeId } = req.params;
    const { quantity } = req.body;

    // Cek apakah produk ada
    const product = await productRepository.getProductById(id);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });

    // Cari ProductSize
    const productSize = await productSizeRepository.getProductSizeStock(
      id,
      sizeId
    );
    if (!productSize)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Ukuran tidak ditemukan untuk produk ini",
        });

    const result = await productSizeRepository.updateProductSize(
      productSize.id,
      {
        quantity: parseInt(quantity) || 0,
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Stok ukuran produk berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    console.error("Error updateProductSize:", error);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Gagal memperbarui stok ukuran produk",
      });
  }
};

export const deleteProductSize = async (req, res) => {
  try {
    const { id, sizeId } = req.params;

    // Cek apakah produk ada
    const product = await productRepository.getProductById(id);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan" });

    // Cari ProductSize
    const productSize = await productSizeRepository.getProductSizeStock(
      id,
      sizeId
    );
    if (!productSize)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Ukuran tidak ditemukan untuk produk ini",
        });

    await productSizeRepository.deleteProductSize(productSize.id);

    return res.status(200).json({
      status: "success",
      message: "Ukuran produk berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleteProductSize:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menghapus ukuran produk" });
  }
};

export const syncAllProductStocks = async (req, res) => {
  try {
    const result = await productSizeRepository.syncAllProductStocks();
    return res.status(200).json({
      status: "success",
      message: "Berhasil menyinkronkan semua stok produk",
      data: result,
    });
  } catch (error) {
    console.error("Error syncAllProductStocks:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Gagal menyinkronkan stok produk" });
  }
};
