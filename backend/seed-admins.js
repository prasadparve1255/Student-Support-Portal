const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Sample admin data
const sampleAdmins = [
  {
    username: 'admin',
    name: 'Main Administrator',
    email: 'admin@digitalcomplaint.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'defaultAdminPassword',
    isMainAdmin: true,
    role: 'MAIN_ADMIN'
  },
  {
    username: 'csadmin',
    name: 'CS Department Admin',
    email: 'csadmin@digitalcomplaint.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'defaultAdminPassword',
    isMainAdmin: false,
    role: 'DEPARTMENT_ADMIN'
  },
  {
    username: 'ecadmin',
    name: 'EC Department Admin',
    email: 'ecadmin@digitalcomplaint.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'defaultAdminPassword',
    isMainAdmin: false,
    role: 'DEPARTMENT_ADMIN'
  }
];

// Seed data function
const seedAdmins = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    await Admin.deleteMany({});
    console.log('Existing admins deleted');
    
    // Insert sample data using save() so bcrypt pre-save hook runs
    const admins = [];
    for (const data of sampleAdmins) {
      const admin = new Admin(data);
      await admin.save();
      admins.push(admin);
    }
    console.log(`${admins.length} admins inserted`);
    
    console.log('Admin seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmins();