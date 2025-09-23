import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  errorFormat: "pretty",
});

export const testConnection = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    return false;
  }
};

export default prisma;
