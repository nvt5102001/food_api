const cartService = require("./cart.service");

const getAllCarts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      const userCartItems = await cartService.getCartByUser(userId);
      return res.json(userCartItems);
    }
    const carts = await cartService.getAllCarts();
    res.json(carts);
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.id);
    if (!cart) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const cart = await cartService.addToCart(userId, req.body);
    res.status(201).json(cart);
  } catch (error) {
    console.error("Create cart error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const cart = await cartService.updateCart(req.params.id, req.body);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const cart = await cartService.deleteCart(req.params.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
};
