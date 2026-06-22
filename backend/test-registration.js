const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Department = require('./models/Department');
const connectDB = require('./config/db');

dotenv.config();

const testRegistration = async () => {
    try {
        await connectDB();
        
        // Find a department
        const department = await Department.findOne();
        console.log('Found department:', department);
        
        if (!department) {
            console.log('No departments found. Running seed first...');
            process.exit(1);
        }
        
        // Create test student
        const testStudent = {
            name: 'Test Student',
            email: 'test@example.com',
            studentId: 'TEST001',
            department: department._id,
            password: 'testpassword'
        };
        
        console.log('Creating student with data:', testStudent);
        
        const student = new Student(testStudent);
        await student.save();
        
        console.log('Student created successfully:', student.name);
        
        process.exit(0);
    } catch (error) {
        console.error('Test registration failed:', error);
        process.exit(1);
    }
};

testRegistration();