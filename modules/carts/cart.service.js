const prisma = require("../../prisma/client");

// Get active cart and all item details for a specific user
const getCartByUser = async (userId) => {
  let userCart = await prisma.cart.findFirst({
    where: { user_id: Number(userId), status: "active" },
    include: {
      cart_detail: {
        include: {
          product: {
            include: {
              image: true,
            },
          },
        },
        orderBy: { cart_detail_id: "asc" },
      },
    },
  });

  if (!userCart) {
    return [];
  }

  // Format into flat list matching frontend CartItem expectations
  return userCart.cart_detail.map((detail) => ({
    id: detail.cart_detail_id,
    cart_detail_id: detail.cart_detail_id,
    cart_id: detail.cart_id,
    product_id: detail.product_id,
    quantity: detail.quantity,
    unit_price: detail.unit_price,
    price: detail.unit_price || detail.product?.price,
    Product: detail.product,
    product: detail.product,
  }));
};

const getAllCarts = async () => {
  return await prisma.cart.findMany({
    include: {
      cart_detail: {
        include: { product: true },
      },
    },
  });
};

const getCartById = async (id) => {
  return await prisma.cart_detail.findUnique({
    where: { cart_detail_id: Number(id) },
    include: { product: true },
  });
};

// Add product to user's active cart
const addToCart = async (userId, data) => {
  const productId = Number(data.product_id || data.productId);
  const quantity = Number(data.quantity || 1);

  // Find or create active cart for user
  let userCart = await prisma.cart.findFirst({
    where: { user_id: Number(userId), status: "active" },
  });

  if (!userCart) {
    userCart = await prisma.cart.create({
      data: {
        user_id: Number(userId),
        status: "active",
      },
    });
  }

  // Fetch product price
  const prod = await prisma.product.findUnique({
    where: { product_id: productId },
  });

  const unitPrice = prod?.price || 0;

  // Check if product already in cart_detail
  let existingDetail = await prisma.cart_detail.findFirst({
    where: {
      cart_id: userCart.cart_id,
      product_id: productId,
    },
  });

  if (existingDetail) {
    return await prisma.cart_detail.update({
      where: { cart_detail_id: existingDetail.cart_detail_id },
      data: { quantity: existingDetail.quantity + quantity },
      include: { product: true },
    });
  }

  return await prisma.cart_detail.create({
    data: {
      cart_id: userCart.cart_id,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    },
    include: { product: true },
  });
};

const updateCart = async (id, data) => {
  const detailId = Number(id);
  const quantity = Number(data.quantity);

  return await prisma.cart_detail.update({
    where: { cart_detail_id: detailId },
    data: { quantity },
    include: { product: true },
  });
};

const deleteCart = async (id) => {
  const detailId = Number(id);
  return await prisma.cart_detail.delete({
    where: { cart_detail_id: detailId },
  });
};

module.exports = {
  getCartByUser,
  getAllCarts,
  getCartById,
  addToCart,
  updateCart,
  deleteCart,
};
