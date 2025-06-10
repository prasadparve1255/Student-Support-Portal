const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Department = require('./models/Department');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Complaint = require('./models/Complaint');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample data
const departments = [
  {
    name: 'Computer Science',
    code: 'CS',
    description: 'Department of Computer Science and Engineering'
  },
  {
    name: 'Electrical Engineering',
    code: 'EE',
    description: 'Department of Electrical Engineering'
  },
  {
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Department of Mechanical Engineering'
  },
  {
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Department of Civil Engineering'
  }
];

// Function to seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Department.deleteMany({});
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Complaint.deleteMany({});
    
    console.log('Previous data cleared');

    // Insert departments
    const createdDepartments = await Department.insertMany(departments);
    console.log(`${createdDepartments.length} departments created`);

    // Create main admin
    const mainAdmin = await Admin.create({
      name: 'Main Admin',
      email: 'admin@example.com',
      password: 'admin123',
      isMainAdmin: true
    });
    console.log('Main admin created');

    // Create department admins
    const departmentAdmins = [];
    for (const dept of createdDepartments) {
      const admin = await Admin.create({
        name: `${dept.name} Admin`,
        email: `${dept.code.toLowerCase()}admin@example.com`,
        password: 'admin123',
        department: dept._id,
        isMainAdmin: false
      });
      departmentAdmins.push(admin);
    }
    console.log(`${departmentAdmins.length} department admins created`);

    // Create students
    const students = [];
    const studentCount = 20; // 5 students per department
    const desertStatuses = ['None', 'Pending', 'Approved', 'Rejected'];
    const desertReasons = [
      'Requested transfer to another institution',
      'Financial difficulties',
      'Family reasons',
      'Health issues',
      'Academic performance concerns',
      'Relocation to another city',
      'Career change',
      'Personal reasons'
    ];
    
    for (let i = 0; i < studentCount; i++) {
      const deptIndex = i % createdDepartments.length;
      const dept = createdDepartments[deptIndex];
      const studentId = `${dept.code}${2023}${String(i).padStart(3, '0')}`;
      
      // Assign desert status to some students
      const hasDesertData = i % 3 === 0; // Every third student has desert data
      const desertStatus = hasDesertData ? desertStatuses[i % desertStatuses.length] : 'None';
      const desertReason = hasDesertData ? desertReasons[i % desertReasons.length] : '';
      const desertDate = hasDesertData ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null;
      
      const student = await Student.create({
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.com`,
        studentId: studentId,
        department: dept._id,
        password: 'student123',
        createdBy: i < 10 ? mainAdmin._id : departmentAdmins[deptIndex]._id,
        registrationSource: i < 10 ? 'MANI_ADMIN' : 'DEPARTMENT_DASHBOARD',
        desertStatus: desertStatus,
        desertReason: desertReason,
        desertDate: desertDate
      });
      
      students.push(student);
    }
    console.log(`${students.length} students created`);

    // Create complaints
    const complaintTypes = ['Facility', 'Academic', 'Hostel', 'Transport', 'Other'];
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    const priorities = ['Low', 'Medium', 'High'];
    
    const complaints = [];
    const complaintCount = 30;
    
    for (let i = 0; i < complaintCount; i++) {
      const studentIndex = Math.floor(Math.random() * students.length);
      const student = students[studentIndex];
      const dept = await Department.findById(student.department);
      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];
      const category = complaintTypes[i % complaintTypes.length];
      
      const complaint = await Complaint.create({
        name: student.name,
        department: dept.name,
        rollNumber: student.studentId,
        subject: `${category} Issue ${i + 1}`,
        description: `This is a sample ${category.toLowerCase()} complaint description for testing purposes.`,
        status: status,
        priority: priority,
        category: category,
        studentEmail: student.email,
        adminResponse: status !== 'Pending' ? `This issue has been ${status === 'Resolved' ? 'resolved' : 'acknowledged'} by the administration.` : '',
        isNotification: status !== 'Pending',
        isArchived: status === 'Resolved'
      });
      
      complaints.push(complaint);
    }
    console.log(`${complaints.length} complaints created`);

    console.log('Sample data seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();