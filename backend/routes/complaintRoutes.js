const express = require('express');
const {
  submitComplaint,
  getComplaintsByDepartment,
  getAllComplaints,
  getComplaintsByStudentId,
  updateComplaintStatus,
  markNotificationAsRead,
} = require('../controllers/complaintController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Submit complaint with optional file attachments
router.post('/submit', verifyToken, upload.array('attachments', 5), submitComplaint);

// Get all complaints (admin only) - before /:department to avoid capture
router.get('/all', verifyToken, isAdmin, getAllComplaints);

// Get complaints by student ID
router.get('/student/:studentId', verifyToken, getComplaintsByStudentId);

// Update complaint status (admin only)
router.put('/:id/status', verifyToken, isAdmin, updateComplaintStatus);

// Mark notification as read (student)
router.put('/:id/read', verifyToken, markNotificationAsRead);

// Get complaints by department
router.get('/department/:department', verifyToken, getComplaintsByDepartment);

module.exports = router;
