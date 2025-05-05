// repositories/productRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProducts = async ({ search, limit, page }) => {
  const take = limit ? parseInt(limit) : undefined;
  const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

  const where = search
    ? { nama: { contains: search, mode: "insensitive" } }
    : {};

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take,
      skip,
      orderBy: { updatedAt: "desc" },
      include: {
        brand: true,
        category: true,
        productType: true,
        stockBatch: true,
        sizes: { include: { size: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : total,
      totalPages: limit ? Math.ceil(total / parseInt(limit)) : 1,
    },
  };
};

export const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      productType: true,
      stockBatch: true,
      sizes: { include: { size: true } },
    },
  });
};

export const createProduct = async ({ sizes, ...data }) => {
  return prisma.product.create({
    data: {
      ...data,
      sizes: {
        create: sizes,
      },
    },
    include: {
      sizes: true,
    },
  });
};

export const updateProduct = async (id, data) => {
  // Sederhana: tidak memperbarui ukuran lama. Untuk update ukuran, kamu bisa hapus dan tambah ulang.
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id) => {
  return prisma.product.delete({ where: { id } });
};

export const isProductNameExists = async (nama) => {
  const count = await prisma.product.count({ where: { nama } });
  return count > 0;
};
