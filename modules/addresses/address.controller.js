const addressService = require("./address.service");

const getAddresses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const addresses = await addressService.getAddresses(userId);
    res.json(addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const address = await addressService.getDefaultAddress(userId);
    res.json(address || null);
  } catch (error) {
    console.error("Get default address error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const address = await addressService.createAddress(userId, req.body);
    res.status(201).json(address);
  } catch (error) {
    console.error("Create address error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const address = await addressService.updateAddress(userId, req.params.id, req.body);
    res.json(address);
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ error: error.message });
  }
};

const setDefault = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const address = await addressService.setDefaultAddress(userId, req.params.id);
    res.json(address);
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const result = await addressService.deleteAddress(userId, req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  setDefault,
  deleteAddress,
};
