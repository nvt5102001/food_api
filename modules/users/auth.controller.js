const userService = require("./auth.service");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const login = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request body" });
    }
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { user, token } = await userService.login(email, password);

    res.cookie("token", token, cookieOptions);
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: error.message || "Invalid credentials" });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, phone, phone_number } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await userService.register({
      email,
      password,
      name: name || null,
      phone_number: phone_number || phone || null,
    });

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ message: error.message || "Registration failed" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logout successful" });
};

const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  logout,
  register,
  getMe,
};
