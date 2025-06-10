const express = require('express');
const { 
  submitComplaint, 
  getComplaintsByDepartment, 
  getAllComplaints,
  getComplaintsByStudentId
} = require('../controllers/complaintController');

const router = express.Router();

// Submit a new complaint
router.post('/submit', submitComplaint);

// Get all complaints
router.get('/all', getAllComplaints);

// Get complaints by student ID
router.get('/student/:studentId', getComplaintsByStudentId);

// Get complaints by department
router.get('/:department', getComplaintsByDepartment);

module.exports = router;
