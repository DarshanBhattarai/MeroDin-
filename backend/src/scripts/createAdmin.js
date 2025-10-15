// scripts/createAdmin.js
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/auth.js";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFullName = process.env.ADMIN_FULL_NAME || "System Administrator";

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables"
      );
    }

    console.log("🔧 Creating admin user...");
    console.log("   Email:", adminEmail);
    console.log("   Full Name:", adminFullName);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { adminProfile: true },
    });

    if (existingAdmin) {
      if (existingAdmin.role === "ADMIN") {
        console.log("✅ Admin user already exists:", adminEmail);

        // Update password if needed
        const hashedPassword = await hashPassword(adminPassword);
        if (existingAdmin.password !== hashedPassword) {
          await prisma.user.update({
            where: { email: adminEmail },
            data: { password: hashedPassword },
          });
          console.log("✅ Admin password updated");
        }
        return;
      } else {
        // Upgrade existing user to admin
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            role: "ADMIN",
            ...(existingAdmin.adminProfile
              ? {}
              : {
                  adminProfile: {
                    create: {
                      permissions: ["ALL"],
                    },
                  },
                }),
          },
        });
        console.log("✅ Existing user upgraded to admin:", adminEmail);
        return;
      }
    }

    // Create new admin user
    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: adminFullName,
        password: hashedPassword,
        role: "ADMIN",
        isEmailVerified: true,
        adminProfile: {
          create: {
            permissions: ["ALL"],
          },
        },
      },
      include: {
        adminProfile: true,
      },
    });

    console.log("✅ Admin user created successfully:");
    console.log("   ID:", adminUser.id);
    console.log("   Email:", adminUser.email);
    console.log("   Role:", adminUser.role);
    console.log("   Permissions:", adminUser.adminProfile?.permissions);
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
