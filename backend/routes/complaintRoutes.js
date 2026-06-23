const express = require('express');
const {
  submitComplaint,
  getComplaintsByDepartment,
  getAllComplaints,
  getComplaintsByStudentId,
  updateComplaintStatus,
  markNotificationAsRead,
  deleteComplaint,
} = require('../controllers/complaintController');
const { verifyToken, isAdmin, isStudent } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/submit', verifyToken, upload.array('attachments', 5), submitComplaint);
router.get('/all', verifyToken, isAdmin, getAllComplaints);
router.get('/student/:studentId', verifyToken, getComplaintsByStudentId);
router.put('/:id/status', verifyToken, isAdmin, updateComplaintStatus);
router.put('/:id/read', verifyToken, markNotificationAsRead);
router.delete('/:id', verifyToken, isStudent, deleteComplaint);
router.get('/department/:department', verifyToken, getComplaintsByDepartment);

module.exports = router;
