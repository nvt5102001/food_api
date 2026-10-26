const router = require("express").Router();
const orderController = require("./order.controller");
const auth = require("../../middlewares/auth");

router.get("/", auth, orderController.getAllOrders);
router.get("/:id", auth, orderController.getOrderById);
router.post("/", auth, orderController.createOrder);
router.put("/:id", auth, orderController.updateOrder);
router.delete("/:id", auth, orderController.deleteOrder);

module.exports = router;
