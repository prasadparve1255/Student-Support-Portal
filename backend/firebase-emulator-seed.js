// Script to seed Firebase Emulator with sample data
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin with emulator
admin.initializeApp({
  projectId: 'digital-complaint-system',
});

// Configure to use emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const db = getFirestore();

// Sample data from the React app
const defaultStudents = [
  {
    id: 'CS001',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    department: 'Computer Science & Engineering',
    password: 'password123',
  },
  {
    id: 'EC002',
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    department: 'Electronics & Communication',
    password: 'password123',
  },
  {
    id: 'ME003',
    name: 'Mike Johnson',
    email: 'mike.johnson@university.edu',
    department: 'Mechanical Engineering',
    password: 'password123',
  },
];

const defaultAdmins = [
  {
    username: 'admin',
    password: 'admin123',
    department: 'All Departments',
    isMainAdmin: true,
  },
  {
    username: 'csadmin',
    password: 'admin123',
    department: 'Computer Science & Engineering',
    isMainAdmin: false,
  },
  {
    username: 'ecadmin',
    password: 'admin123',
    department: 'Electronics & Communication',
    isMainAdmin: false,
  },
  {
    username: 'meadmin',
    password: 'admin123',
    department: 'Mechanical Engineering',
    isMainAdmin: false,
  },
];

// Sample complaints data
const sampleComplaints = [
  {
    title: 'Broken Projector in Room 101',
    description: 'The projector in Room 101 is not working properly. It keeps shutting down during presentations.',
    department: 'Computer Science & Engineering',
    status: 'pending',
    priority: 'medium',
    studentId: 'CS001',
    studentName: 'John Doe',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Wi-Fi Issues in Library',
    description: 'The Wi-Fi connection in the library is very slow and keeps disconnecting.',
    department: 'Electronics & Communication',
    status: 'in-progress',
    priority: 'high',
    studentId: 'EC002',
    studentName: 'Jane Smith',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    title: 'Broken AC in Mechanical Lab',
    description: 'The air conditioning in the Mechanical Engineering lab is not working, making it difficult to work.',
    department: 'Mechanical Engineering',
    status: 'resolved',
    priority: 'high',
    studentId: 'ME003',
    studentName: 'Mike Johnson',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    resolvedAt: new Date().toISOString(),
  },
];

// Department data
const departments = [
  {
    id: 'cse',
    name: 'Computer Science & Engineering',
    description: 'Department of Computer Science and Engineering',
    adminCount: 1,
    studentCount: 1,
  },
  {
    id: 'ece',
    name: 'Electronics & Communication',
    description: 'Department of Electronics and Communication Engineering',
    adminCount: 1,
    studentCount: 1,
  },
  {
    id: 'me',
    name: 'Mechanical Engineering',
    description: 'Department of Mechanical Engineering',
    adminCount: 1,
    studentCount: 1,
  },
];

// Function to seed data
async function seedFirestore() {
  try {
    // Batch write for students
    console.log('Seeding students collection...');
    const studentsPromises = defaultStudents.map(student => 
      db.collection('students').doc(student.id).set(student)
    );
    await Promise.all(studentsPromises);
    console.log('Students collection seeded successfully');
    
    // Batch write for admins
    console.log('Seeding admins collection...');
    const adminsPromises = defaultAdmins.map((admin, index) => 
      db.collection('admins').doc(`admin${index + 1}`).set(admin)
    );
    await Promise.all(adminsPromises);
    console.log('Admins collection seeded successfully');
    
    // Batch write for complaints
    console.log('Seeding complaints collection...');
    const complaintsPromises = sampleComplaints.map((complaint, index) => 
      db.collection('complaints').doc(`complaint${index + 1}`).set(complaint)
    );
    await Promise.all(complaintsPromises);
    console.log('Complaints collection seeded successfully');
    
    // Batch write for departments
    console.log('Seeding departments collection...');
    const departmentsPromises = departments.map(department => 
      db.collection('departments').doc(department.id).set(department)
    );
    await Promise.all(departmentsPromises);
    console.log('Departments collection seeded successfully');
    
    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFirestore();