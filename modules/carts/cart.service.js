const prisma = require("../../prisma/client");

const getAllCarts = async () => {
  return await prisma.cart.findMany();
};

const getCartById = async (id) => {
  return await prisma.cart.findUnique({
    where: { id },
  });
};

const createCart = async (data) => {
  return await prisma.cart.create({
    data,
  });
};

const updateCart = async (id, data) => {
  return await prisma.cart.update({
    where: { id },
    data,
  });
};

const deleteCart = async (id) => {
  return await prisma.cart.delete({
    where: { id },
  });
};

module.exports = {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
};
