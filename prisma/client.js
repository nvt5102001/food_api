require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client.js");

// Tự động chuyển đổi giữa Database Local (Dev) và Production (Cloud)
const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : (process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL);

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
