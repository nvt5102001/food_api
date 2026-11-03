const router = require("express").Router();
const addressController = require("./address.controller");
const auth = require("../../middlewares/auth");

router.get("/", auth, addressController.getAddresses);
router.get("/default", auth, addressController.getDefaultAddress);
router.post("/", auth, addressController.createAddress);
router.put("/:id", auth, addressController.updateAddress);
router.patch("/:id/default", auth, addressController.setDefault);
router.delete("/:id", auth, addressController.deleteAddress);

module.exports = router;
