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
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
        },
      },
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
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
        },
      },
    },
  });
};

const createOrder = async (userId, data) => {
  const totalAmount = data.total || data.total_amount || 0;
  const items = data.items || [];
  const paymentMethod = data.payment_method || "cod";
  const shippingAddress = data.shipping_address || data.address || "";
  const phone = data.phone || data.recipient_phone || "";
  const recipientName = data.recipient_name || data.name || "";

  let finalAddressId = data.address_id ? Number(data.address_id) : null;

  // Nếu người dùng chưa chọn address_id có sẵn nhưng có nhập địa chỉ
  if (!finalAddressId && shippingAddress) {
    const count = await prisma.address.count({
      where: { user_id: Number(userId), deleted_at: null },
    });

    const isFirstAddress = count === 0;
    const shouldBeDefault = Boolean(data.is_default || isFirstAddress);

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { user_id: Number(userId) },
        data: { is_default: false },
      });
    }

    const formattedFullAddress = (recipientName || phone) && !shippingAddress.includes(" - ")
      ? `${recipientName ? recipientName : ""} ${phone ? `(${phone})` : ""} - ${shippingAddress}`.trim()
      : shippingAddress;

    const addressRecord = await prisma.address.create({
      data: {
        user_id: Number(userId),
        full_address: formattedFullAddress,
        is_default: shouldBeDefault,
      },
    });

    finalAddressId = addressRecord.id;
  }

  // Cập nhật thông tin profile nếu chưa có
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
      address_id: finalAddressId,
      status: "pending",
    },
  });

  for (const item of items) {
    const pId = Number(item.product_id || item.productId);
    if (pId) {
      await prisma.order_detail.create({
        data: {
          order_id: newOrder.order_id,
          product_id: pId,
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.price || item.unit_price || 0),
        },
      });
    }
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
  const updateData = {};
  if (data.status) updateData.status = data.status;
  if (data.total_amount !== undefined) updateData.total_amount = data.total_amount;
  if (data.address_id !== undefined) updateData.address_id = Number(data.address_id);
  updateData.updated_at = new Date();

  return await prisma.orders.update({
    where: { order_id: Number(id) },
    data: updateData,
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
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_number: true,
        },
      },
    },
  });
};

const deleteOrder = async (id) => {
  // Xóa các liên kết trước nếu cần
  await prisma.order_detail.deleteMany({
    where: { order_id: Number(id) },
  });
  await prisma.payment_method.deleteMany({
    where: { order_id: Number(id) },
  });

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
