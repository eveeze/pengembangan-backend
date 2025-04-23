// repositories/productRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProducts = async ({ search, limit, page }) => {
  const take = limit ? parseInt(limit) : undefined;
  const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

  const where = search
    ? {
        nama: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take,
      skip,
      orderBy: { updatedAt: "desc" },
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
  });
};

export const createProduct = async (data) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (id, data) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id) => {
  return prisma.product.delete({
    where: { id },
  });
};

export const isProductNameExists = async (nama) => {
  const count = await prisma.product.count({ where: { nama } });
  return count > 0;
};