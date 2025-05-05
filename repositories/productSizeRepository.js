// repositories/productSizeRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fungsi untuk mendapatkan semua kombinasi produk-ukuran
export const getAllProductSizes = async () => {
  return prisma.productSize.findMany({
    include: {
      product: {
        select: {
          id: true,
          nama: true,
          image: true,
          hargaJual: true,
        },
      },
      size: true,
    },
  });
};

// Fungsi untuk mendapatkan detail kombinasi produk-ukuran berdasarkan ID
export const getProductSizeById = async (id) => {
  return prisma.productSize.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          nama: true,
          image: true,
          hargaJual: true,
        },
      },
      size: true,
    },
  });
};

// Fungsi untuk memeriksa apakah kombinasi produk-ukuran sudah ada
export const isProductSizeExists = async (productId, sizeId) => {
  const exists = await prisma.productSize.findFirst({
    where: {
      productId,
      sizeId,
    },
  });
  return !!exists;
};

// Fungsi untuk mendapatkan stok berdasarkan produk dan ukuran
export const getProductSizeStock = async (productId, sizeId) => {
  return prisma.productSize.findFirst({
    where: {
      productId,
      sizeId,
    },
    include: {
      size: true,
    },
  });
};

// Fungsi untuk membuat kombinasi produk-ukuran baru
export const createProductSize = async (data) => {
  const { productId, sizeId, quantity } = data;

  // Transaksi database untuk memastikan konsistensi data
  return prisma.$transaction(async (tx) => {
    // Buat entry ProductSize baru
    const productSize = await tx.productSize.create({
      data: {
        productId,
        sizeId,
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            nama: true,
          },
        },
        size: true,
      },
    });

    // Update total stok pada produk
    await updateProductTotalStock(tx, productId);

    return productSize;
  });
};

// Fungsi untuk mengupdate kombinasi produk-ukuran
export const updateProductSize = async (id, data) => {
  const { quantity } = data;
  const productSize = await prisma.productSize.findUnique({
    where: { id },
    select: { productId: true },
  });

  // Transaksi database untuk memastikan konsistensi data
  return prisma.$transaction(async (tx) => {
    // Update entry ProductSize
    const updated = await tx.productSize.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            nama: true,
          },
        },
        size: true,
      },
    });

    // Update total stok pada produk
    await updateProductTotalStock(tx, productSize.productId);

    return updated;
  });
};

// Fungsi untuk menghapus kombinasi produk-ukuran
export const deleteProductSize = async (id) => {
  const productSize = await prisma.productSize.findUnique({
    where: { id },
    select: { productId: true },
  });

  // Transaksi database untuk memastikan konsistensi data
  return prisma.$transaction(async (tx) => {
    // Hapus entry ProductSize
    await tx.productSize.delete({
      where: { id },
    });

    // Update total stok pada produk
    await updateProductTotalStock(tx, productSize.productId);
  });
};

// Fungsi untuk mengupdate stok setelah transaksi
export const updateStockAfterTransaction = async (items, isCreate = true) => {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const { productId, sizeId, quantity } = item;

      // Cari ProductSize
      const productSize = await tx.productSize.findFirst({
        where: {
          productId,
          sizeId,
        },
      });

      if (!productSize) {
        throw new Error(
          `Kombinasi produk-ukuran tidak ditemukan: ${productId} - ${sizeId}`
        );
      }

      // Update stok pada ProductSize
      // Jika isCreate true (transaksi baru), kurangi stok
      // Jika isCreate false (hapus transaksi), tambah stok
      const newQuantity = isCreate
        ? productSize.quantity - quantity
        : productSize.quantity + quantity;

      if (newQuantity < 0) {
        throw new Error("Stok tidak mencukupi");
      }

      await tx.productSize.update({
        where: { id: productSize.id },
        data: { quantity: newQuantity },
      });

      // Update total stok pada produk
      await updateProductTotalStock(tx, productId);
    }
  });
};

// Fungsi untuk menyinkronkan stok produk dengan jumlah semua quantity pada ProductSize
export const updateProductTotalStock = async (tx, productId) => {
  // Hitung total stok dari semua ProductSize terkait
  const result = await tx.productSize.aggregate({
    where: {
      productId,
    },
    _sum: {
      quantity: true,
    },
  });

  const totalStock = result._sum.quantity || 0;

  // Update stok pada produk
  await tx.product.update({
    where: { id: productId },
    data: { stock: totalStock },
  });

  return totalStock;
};

// Fungsi untuk menyinkronkan semua stok produk (dapat digunakan untuk perbaikan data)
export const syncAllProductStocks = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
    },
  });

  for (const product of products) {
    await updateProductTotalStock(prisma, product.id);
  }

  return { success: true, count: products.length };
};
