// repositories/transactionRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTransaction = async ({ customerId, totalAmount, paymentMethod, diskon, catatan, userId, items }) => {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        customerId,
        totalAmount,
        paymentMethod,
        diskon,
        catatan,
        userId,
      },
    });

    const transactionItemsData = items.map((item) => ({
      transactionId: transaction.id,
      productId: item.productId,
      sizeId: item.sizeId,
      quantity: item.quantity,
      hargaBeli: item.hargaBeli,
      hargaJual: item.hargaJual,
      diskon: item.diskon || 0,
    }));

    await tx.transactionItem.createMany({
      data: transactionItemsData,
    });

    for (const item of items) {
      await tx.productSize.updateMany({
        where: {
          productId: item.productId,
          sizeId: item.sizeId,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return transaction;
  });
};

export const getAllTransactions = async () => {
  return await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          size: true,
        },
      },
      processedBy: true,
    },
  });
};

export const getTransactionById = async (id) => {
  return await prisma.transaction.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          size: true,
        },
      },
      processedBy: true,
    },
  });
};

export const deleteTransaction = async (id) => {
    return await prisma.$transaction(async (tx) => {
      await tx.transactionItem.deleteMany({
        where: { transactionId: id },
      });
  
      await tx.transaction.delete({
        where: { id },
      });
    });
  };  
