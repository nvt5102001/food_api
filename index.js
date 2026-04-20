const express = require("express");
var morgan = require("morgan"); // HTTP request logger middleware
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

// Importing route modules
const productRouters = require("./modules/products/product.route");
const cartRouters = require("./modules/carts/cart.route");
const orderRouters = require("./modules/orders/order.route");

// Middleware setup
app.use(morgan("combined"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Routes setup
app.use("/products", productRouters);
app.use("/carts", cartRouters);
app.use("/orders", orderRouters);

// Start the server
app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});
