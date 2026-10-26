const prisma = require("../../prisma/client");

const getAllOrders = async (userId) => {
  const where = userId ? { user_id: Number(userId) } : undefined;
  return await prisma.orders.findMany({
    where,
    include: {
      order_detail: {
        include: {
          product: {
            include: {
              image: true,
            },
          },
        },
      },
      payment_method: true,
      address: true,
    },
    orderBy: { order_id: "desc" },
  });
};

const getOrderById = async (id) => {
  return await prisma.orders.findUnique({
    where: { order_id: Number(id) },
    include: {
      order_detail: {
        include: {
          product: {
            include: {
              image: true,
            },
          },
        },
      },
      payment_method: true,
      address: true,
    },
  });
};

const createOrder = async (userId, data) => {
  const totalAmount = data.total || data.total_amount || 0;
  const items = data.items || [];
  const paymentMethod = data.payment_method || "cod";
  const shippingAddress = data.shipping_address || "";
  const phone = data.phone || data.recipient_phone || "";
  const recipientName = data.recipient_name || data.name || "";

  let addressRecord = null;
  if (shippingAddress) {
    addressRecord = await prisma.address.create({
      data: {
        user_id: Number(userId),
        full_address: recipientName ? `${recipientName} (${phone}) - ${shippingAddress}` : (phone ? `${phone} - ${shippingAddress}` : shippingAddress),
      },
    });
  }

  if (recipientName) {
    await prisma.users.updateMany({
      where: { id: Number(userId), name: null },
      data: { name: recipientName },
    });
  }
  if (phone) {
    await prisma.users.updateMany({
      where: { id: Number(userId), phone_number: null },
      data: { phone_number: phone },
    });
  }

  const newOrder = await prisma.orders.create({
    data: {
      user_id: Number(userId),
      total_amount: totalAmount,
      address_id: addressRecord ? addressRecord.id : null,
      status: "processing",
    },
  });

  for (const item of items) {
    await prisma.order_detail.create({
      data: {
        order_id: newOrder.order_id,
        product_id: Number(item.product_id || item.productId),
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.price || item.unit_price || 0),
      },
    });
  }

  await prisma.payment_method.create({
    data: {
      order_id: newOrder.order_id,
      method: paymentMethod,
      status: "pending",
    },
  });

  await prisma.cart.updateMany({
    where: { user_id: Number(userId), status: "active" },
    data: { status: "completed" },
  });

  return await getOrderById(newOrder.order_id);
};

const updateOrder = async (id, data) => {
  return await prisma.orders.update({
    where: { order_id: Number(id) },
    data,
  });
};

const deleteOrder = async (id) => {
  return await prisma.orders.delete({
    where: { order_id: Number(id) },
  });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
