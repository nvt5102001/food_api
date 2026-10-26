const router = require("express").Router();
const cartController = require("./cart.controller");
const auth = require("../../middlewares/auth");

router.get("/", auth, cartController.getAllCarts);
router.get("/:id", auth, cartController.getCartById);
router.post("/", auth, cartController.createCart);
router.put("/:id", auth, cartController.updateCart);
router.delete("/:id", auth, cartController.deleteCart);

module.exports = router;
