const prisma = require("../../prisma/client");

const getAddresses = async (userId) => {
  return await prisma.address.findMany({
    where: {
      user_id: Number(userId),
      deleted_at: null,
    },
    orderBy: [
      { is_default: "desc" },
      { id: "desc" },
    ],
  });
};

const getDefaultAddress = async (userId) => {
  const defaultAddr = await prisma.address.findFirst({
    where: {
      user_id: Number(userId),
      is_default: true,
      deleted_at: null,
    },
  });

  if (defaultAddr) return defaultAddr;

  // Fallback to the latest address if no default is explicitly marked
  return await prisma.address.findFirst({
    where: {
      user_id: Number(userId),
      deleted_at: null,
    },
    orderBy: { id: "desc" },
  });
};

const formatAddressString = (recipientName, phone, address) => {
  const parts = [];
  if (recipientName && phone) {
    parts.push(`${recipientName} (${phone})`);
  } else if (recipientName) {
    parts.push(recipientName);
  } else if (phone) {
    parts.push(phone);
  }

  if (address) {
    parts.push(address);
  }

  return parts.join(" - ");
};

const createAddress = async (userId, data) => {
  const recipientName = data.recipient_name || data.name || "";
  const phone = data.phone || data.phone_number || "";
  const rawAddress = data.full_address || data.address || "";

  // Combine into standardized full_address if separate fields are given
  const fullAddress = data.raw_address
    ? data.raw_address
    : (recipientName || phone) && !rawAddress.includes(" - ")
    ? formatAddressString(recipientName, phone, rawAddress)
    : rawAddress;

  const count = await prisma.address.count({
    where: { user_id: Number(userId), deleted_at: null },
  });

  // If this is the user's first address, automatically mark as default
  const shouldBeDefault = Boolean(data.is_default || count === 0);

  if (shouldBeDefault) {
    await prisma.address.updateMany({
      where: { user_id: Number(userId) },
      data: { is_default: false },
    });
  }

  return await prisma.address.create({
    data: {
      user_id: Number(userId),
      full_address: fullAddress,
      ward: data.ward || null,
      province: data.province || null,
      is_default: shouldBeDefault,
    },
  });
};

const updateAddress = async (userId, addressId, data) => {
  const recipientName = data.recipient_name || data.name || "";
  const phone = data.phone || data.phone_number || "";
  const rawAddress = data.full_address || data.address || "";

  const fullAddress = (recipientName || phone) && !rawAddress.includes(" - ")
    ? formatAddressString(recipientName, phone, rawAddress)
    : rawAddress;

  if (data.is_default) {
    await prisma.address.updateMany({
      where: { user_id: Number(userId) },
      data: { is_default: false },
    });
  }

  const updateData = {
    updated_at: new Date(),
  };

  if (fullAddress) updateData.full_address = fullAddress;
  if (data.ward !== undefined) updateData.ward = data.ward;
  if (data.province !== undefined) updateData.province = data.province;
  if (data.is_default !== undefined) updateData.is_default = Boolean(data.is_default);

  return await prisma.address.update({
    where: { id: Number(addressId) },
    data: updateData,
  });
};

const setDefaultAddress = async (userId, addressId) => {
  await prisma.address.updateMany({
    where: { user_id: Number(userId) },
    data: { is_default: false },
  });

  return await prisma.address.update({
    where: { id: Number(addressId) },
    data: { is_default: true, updated_at: new Date() },
  });
};

const deleteAddress = async (userId, addressId) => {
  const addr = await prisma.address.findFirst({
    where: { id: Number(addressId), user_id: Number(userId) },
  });

  if (!addr) {
    throw new Error("Address not found");
  }

  await prisma.address.delete({
    where: { id: Number(addressId) },
  });

  // If the deleted address was default, set the newest remaining address as default
  if (addr.is_default) {
    const remaining = await prisma.address.findFirst({
      where: { user_id: Number(userId), deleted_at: null },
      orderBy: { id: "desc" },
    });
    if (remaining) {
      await prisma.address.update({
        where: { id: remaining.id },
        data: { is_default: true },
      });
    }
  }

  return { message: "Address deleted successfully" };
};

module.exports = {
  getAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
