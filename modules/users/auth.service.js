const prisma = require("../../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const users = prisma.users;

const generateToken = (user) => {
  const secret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev_jwt_secret" : undefined);
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name || null },
    secret,
    { expiresIn: "7d" }
  );
};

const login = async (email, password) => {
  const user = await users.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone_number: user.phone_number,
    },
    token,
  };
};

const register = async ({ email, password, name, phone_number }) => {
  const existingUser = await users.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await users.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      phone_number: phone_number || null,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone_number: user.phone_number,
    created_at: user.created_at,
  };
};

const getUserById = async (id) => {
  return await users.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      created_at: true,
    },
  });
};

module.exports = {
  login,
  register,
  getUserById,
};
