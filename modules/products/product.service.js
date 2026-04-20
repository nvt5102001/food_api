const prisma = require("../../prisma/client.js");

const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      image: {
        select: {
          url: true,
        },
      },
    },
  });
};

const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { product_id: Number(id) },
    include: {
      image: {
        select: {
          url: true,
        },
      },
    },
  });
};

const createProduct = async (data) => {
  return await prisma.product.create({
    data: {
      ...data,
    },
  });
};

const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: { product_id: Number(id) },
    data: {
      ...data,
    },
  });
};

const deleteProduct = async (id) => {
  const productId = Number(id);

  return await prisma.$transaction([
    prisma.inventory.deleteMany({
      where: { product_id: productId },
    }),
    prisma.product.delete({
      where: { product_id: productId },
    }),
  ]);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
