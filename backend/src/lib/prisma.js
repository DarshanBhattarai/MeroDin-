import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn", "info"],
  errorFormat: "pretty",
});

// Test database connection function
async function testConnection() {
  try {
    console.log("Attempting database connection...");
    console.log(
      "Database URL:",
      process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":****@")
    ); // Hide password
    await prisma.$connect();
    const result =
      await prisma.$queryRaw`SELECT current_database() as db, current_user as user, version() as version`;
    console.log("Database connection successful:", result[0]);
    return true;
  } catch (error) {
    console.error("Database connection failed:", {
      message: error.message,
      code: error.code,
      clientVersion: prisma._engineConfig.generator.config.prismaClientVersion,
    });
    return false;
  }
}

// Middleware for logging queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(
      `Query ${params.model}.${params.action} took ${after - before}ms`
    );
    return result;
  });
}

export { prisma as default, testConnection };
