const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('./models/Complaint');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

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
    createdAt: new Date('2023-05-15T10:30:00.000Z')
  },
  {
    title: 'Wi-Fi Issues in Library',
    description: 'The Wi-Fi connection in the library is very slow and keeps disconnecting.',
    department: 'Electronics & Communication',
    status: 'in-progress',
    priority: 'high',
    studentId: 'EC002',
    studentName: 'Jane Smith',
    createdAt: new Date('2023-05-14T14:20:00.000Z')
  },
  {
    title: 'Broken AC in Mechanical Lab',
    description: 'The air conditioning in the Mechanical Engineering lab is not working, making it difficult to work.',
    department: 'Mechanical Engineering',
    status: 'resolved',
    priority: 'high',
    studentId: 'ME003',
    studentName: 'Mike Johnson',
    createdAt: new Date('2023-05-13T09:15:00.000Z'),
    resolvedAt: new Date('2023-05-15T16:45:00.000Z')
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    await Complaint.deleteMany({});
    console.log('Existing complaints deleted');
    
    // Insert sample data
    const complaints = await Complaint.insertMany(sampleComplaints);
    console.log(`${complaints.length} complaints inserted`);
    
    console.log('Data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();