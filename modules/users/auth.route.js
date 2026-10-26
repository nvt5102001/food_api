const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const auth = require("../../middlewares/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", auth, authController.getMe);

module.exports = router;
