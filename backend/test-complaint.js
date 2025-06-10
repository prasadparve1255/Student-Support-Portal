// Test script to submit a complaint to the API
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/complaints/submit';

const testComplaint = {
  title: 'Test Complaint',
  description: 'This is a test complaint submitted via script',
  department: 'Computer Science & Engineering',
  status: 'pending',
  priority: 'medium',
  studentId: 'CS001',
  studentName: 'John Doe'
};

async function submitTestComplaint() {
  try {
    console.log('Submitting test complaint to:', API_URL);
    console.log('Complaint data:', testComplaint);
    
    const response = await axios.post(API_URL, testComplaint);
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error submitting complaint:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
submitTestComplaint();