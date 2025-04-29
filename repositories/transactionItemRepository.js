// repositories/transactionItemRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findAll = async () => {
  return await prisma.transactionItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      size: true,
      transaction: true,
    },
  });
};

export const findById = async (id) => {
  return await prisma.transactionItem.findUnique({
    where: { id },
    include: {
      product: true,
      size: true,
      transaction: true,
    },
  });
};

export const create = async (data) => {
  const newItem = await prisma.transactionItem.create({
    data,
  });

  // Kurangi stok setelah create item
  await prisma.productSize.updateMany({
    where: {
      productId: data.productId,
      sizeId: data.sizeId,
    },
    data: {
      quantity: {
        decrement: data.quantity,
      },
    },
  });

  return newItem;
};

export const update = async (id, data) => {
  // (Untuk sekarang update item tanpa adjust stok, bisa diimprove di Tahap 4)
  return await prisma.transactionItem.update({
    where: { id },
    data,
  });
};

export const remove = async (id) => {
  // (Untuk sekarang hapus item tanpa rollback stok, bisa diimprove di Tahap 4)
  return await prisma.transactionItem.delete({
    where: { id },
  });
};
