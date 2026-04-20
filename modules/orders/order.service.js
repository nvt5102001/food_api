const prisma = require("../../prisma/client");

const getAllOrders = async () => {
  return await prisma.order.findMany();
};

const getOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
  });
};

const createOrder = async (data) => {
  return await prisma.order.create({
    data,
  });
};

const updateOrder = async (id, data) => {
  return await prisma.order.update({
    where: { id },
    data,
  });
};

const deleteOrder = async (id) => {
  return await prisma.order.delete({
    where: { id },
  });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
