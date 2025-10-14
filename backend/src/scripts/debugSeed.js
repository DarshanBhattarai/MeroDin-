// scripts/debugSeed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function debugSeed() {
  try {
    console.log('🔧 Debugging admin seed...\n');
    
    // Check environment variables
    console.log('1. Environment Check:');
    console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ NOT SET');
    console.log('   ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✅ SET' : '❌ NOT SET');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
    
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.log('❌ Missing environment variables');
      return;
    }

    // Check if admin already exists
    console.log('\n2. Checking existing admin...');
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
      include: { adminProfile: true }
    });

    if (existingAdmin) {
      console.log('   ✅ Admin user exists:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   Admin Profile:', existingAdmin.adminProfile ? 'Exists' : 'Missing');
      return;
    } else {
      console.log('   ❌ No admin user found with email:', process.env.ADMIN_EMAIL);
    }

    // Test creating a user
    console.log('\n3. Testing user creation...');
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    
    const testUser = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL,
        fullName: process.env.ADMIN_FULL_NAME || 'Test Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        loginType: 'EMAIL'
      }
    });

    console.log('   ✅ Test user created successfully!');
    console.log('   ID:', testUser.id);
    console.log('   Email:', testUser.email);

    // Create admin profile
    console.log('\n4. Creating admin profile...');
    const adminProfile = await prisma.admin.create({
      data: {
        userId: testUser.id,
        permissions: ['ALL']
      }
    });

    console.log('   ✅ Admin profile created!');
    console.log('   Permissions:', adminProfile.permissions);

  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    
    if (error.code === 'P2002') {
      console.log('💡 User already exists with this email');
    } else if (error.code === 'P1001') {
      console.log('💡 Cannot connect to database');
    } else {
      console.log('💡 Unknown error - check the script');
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugSeed();