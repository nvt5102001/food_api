const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from cookie or Authorization header
  let token = req.cookies?.token;
  if (!token && req.headers?.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const secret =
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV !== "production" ? "dev_jwt_secret" : undefined);
    if (!secret) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
