import prisma from "../config/prisma.js";

export const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  return user;
};

export const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

export const updateUserVerification = async (email) => {
  const user = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
    },
  });
  return user;
};

export const updateUserOTP = async (email, otp) => {
  const user = await prisma.user.update({
    where: { email },
    data: {
      otp,
    },
  });
  return user;
};

export const updateUserPassword = async (email, password) => {
  const user = await prisma.user.update({
    where: { email },
    data: {
      password,
      otp: null, 
    },
  });
  return user;
};
