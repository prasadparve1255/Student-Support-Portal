const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const Department = require('./models/Department');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Function to seed students
const seedStudents = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get departments
    const departments = await Department.find();
    if (departments.length === 0) {
      console.error('No departments found. Please run seed:departments first.');
      process.exit(1);
    }
    
    // Map departments by name for easier lookup
    const departmentMap = {};
    departments.forEach(dept => {
      departmentMap[dept.name] = dept._id;
    });
    
    // Sample student data
    const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'defaultStudentPassword';
    const sampleStudents = [
      {
        name: 'John Doe',
        email: 'john.doe@university.edu',
        studentId: 'CS001',
        password: await bcrypt.hash(defaultPassword, 10),
        department: departmentMap['Computer Science & Engineering'],
        registrationSource: 'MAIN_ADMIN'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        studentId: 'EC002',
        password: await bcrypt.hash(defaultPassword, 10),
        department: departmentMap['Electronics & Communication'],
        registrationSource: 'MAIN_ADMIN'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@university.edu',
        studentId: 'ME003',
        password: await bcrypt.hash(defaultPassword, 10),
        department: departmentMap['Mechanical Engineering'],
        registrationSource: 'MAIN_ADMIN'
      }
    ];
    
    // Clear existing students
    await Student.deleteMany({});
    console.log('Existing students deleted');
    
    // Insert sample students
    const students = await Student.insertMany(sampleStudents);
    console.log(`${students.length} students inserted`);
    
    console.log('Student seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  }
};

// Run the seed function
seedStudents();