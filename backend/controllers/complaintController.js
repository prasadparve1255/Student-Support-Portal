const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const { sendComplaintSubmittedEmail, sendComplaintStatusUpdateEmail } = require('../utils/emailService');

// Submit a new complaint
const submitComplaint = async (req, res) => {
  try {
    const { studentId, studentName, department, subject, description } = req.body;

    if (!studentId || !studentName || !department || !subject || !description) {
      return res.status(400).json({ error: 'Missing required complaint fields' });
    }

    const complaint = new Complaint({
      ...req.body,
      class: req.body.class || '',
      attachments: req.files ? req.files.map(f => `/uploads/${f.filename}`) : [],
    });
    await complaint.save();

    // Send confirmation email to student
    try {
      const student = await Student.findOne({ studentId: complaint.studentId }).select('name email');
      if (student) {
        await sendComplaintSubmittedEmail({
          name: student.name,
          email: student.email,
          subject: complaint.subject,
          complaintId: complaint._id,
          department: complaint.department,
          category: complaint.category,
        });
      }
    } catch (emailErr) {
      console.error('Complaint submitted email failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Complaint submitted successfully', id: complaint._id });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

// Get complaints by department
const getComplaintsByDepartment = async (req, res) => {
  const { department } = req.params;
  try {
    const complaints = await Complaint.find({ department }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get all complaints (admin only)
const getAllComplaints = async (req, res) => {
  try {
    let query = {};
    // Department admin can only see their department's complaints
    if (req.user && req.user.role === 'DEPARTMENT_ADMIN' && req.user.department) {
      const deptName = req.user.department.name || req.user.department;
      query.department = deptName;
    }
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get complaints by student ID
const getComplaintsByStudentId = async (req, res) => {
  const { studentId } = req.params;
  try {
    const complaints = await Complaint.find({ studentId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Update complaint status (admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const allowed = ['Pending', 'In Progress', 'Resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, adminResponse: adminResponse || '', isNotification: true },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    // Send status update email to student
    try {
      const student = await Student.findOne({ studentId: complaint.studentId }).select('name email');
      if (student) {
        await sendComplaintStatusUpdateEmail({
          name: student.name,
          email: student.email,
          subject: complaint.subject,
          complaintId: complaint._id,
          status,
          adminResponse: adminResponse || '',
        });
      }
    } catch (emailErr) {
      console.error('Status update email failed:', emailErr.message);
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { isNotification: false, isArchived: true },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

module.exports = {
  submitComplaint,
  getComplaintsByDepartment,
  getAllComplaints,
  getComplaintsByStudentId,
  updateComplaintStatus,
  markNotificationAsRead,
};
