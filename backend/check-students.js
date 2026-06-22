const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Department = require('./models/Department');
const connectDB = require('./config/db');

dotenv.config();

const checkStudents = async () => {
    try {
        await connectDB();
        
        const students = await Student.find().populate('department', 'name code');
        console.log('Students in database:', students.length);
        
        students.forEach(student => {
            console.log(`- ${student.name} (${student.studentId}) - ${student.department.name}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error checking students:', error);
        process.exit(1);
    }
};

checkStudents();