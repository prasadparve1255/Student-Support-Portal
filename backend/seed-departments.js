const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/Department');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Sample department data
const sampleDepartments = [
  {
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description: 'Department of Computer Science and Engineering'
  },
  {
    name: 'Electronics & Communication',
    code: 'ECE',
    description: 'Department of Electronics and Communication Engineering'
  },
  {
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Department of Mechanical Engineering'
  }
];

// Seed data function
const seedDepartments = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    await Department.deleteMany({});
    console.log('Existing departments deleted');
    
    // Insert sample data
    const departments = await Department.insertMany(sampleDepartments);
    console.log(`${departments.length} departments inserted`);
    
    console.log('Department seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding department data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDepartments();