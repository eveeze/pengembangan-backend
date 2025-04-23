// repositories/productSizeRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProductSizes = async () => {
  return prisma.productSize.findMany({
    include: {
      product: true,
      size: true,
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const getProductSizeById = async (id) => {
  return prisma.productSize.findUnique({
    where: { id },
    include: {
      product: true,
      size: true,
    },
  });
};

export const createProductSize = async (data) => {
  return prisma.productSize.create({ data });
};

export const updateProductSize = async (id, data) => {
  return prisma.productSize.update({ where: { id }, data });
};

export const deleteProductSize = async (id) => {
  return prisma.productSize.delete({ where: { id } });
};

export const isProductSizeExists = async (productId, sizeId) => {
  const count = await prisma.productSize.count({ where: { productId, sizeId } });
  return count > 0;
};