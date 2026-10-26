const express = require("express");
var morgan = require("morgan"); // HTTP request logger middleware
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");

dotenv.config();

const app = express();
const port = 3000;

// Importing route modules
const productRouters = require("./modules/products/product.route");
const cartRouters = require("./modules/carts/cart.route");
const orderRouters = require("./modules/orders/order.route");
const authenticationRouters = require("./modules/users/auth.route");

// Middleware setup
app.use(morgan("combined"));
app.use(cookies());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: "text/plain" }));
app.use("/uploads", express.static("uploads"));

// Routes setup
app.use("/products", productRouters);
app.use("/carts", cartRouters);
app.use("/orders", orderRouters);

// Use authentication routes
app.use("/auth", authenticationRouters);

// Error handler for body parser and other middleware
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  res.status(500).json({ message: "Server error" });
});

// Start the server
app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});
