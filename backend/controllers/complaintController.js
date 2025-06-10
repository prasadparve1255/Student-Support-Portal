const Complaint = require('../models/Complaint');

// Submit a new complaint
const submitComplaint = async (req, res) => {
  try {
    const complaintData = req.body;
    console.log('Attempting to save complaint:', JSON.stringify(complaintData));
    
    const complaint = new Complaint(complaintData);
    await complaint.save();
    
    console.log('Complaint saved successfully with ID:', complaint._id);
    res.status(201).json({ 
      message: 'Complaint submitted successfully', 
      id: complaint._id 
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ 
      error: `Failed to submit complaint: ${error.message}` 
    });
  }
};

// Get complaints by department
const getComplaintsByDepartment = async (req, res) => {
  const { department } = req.params;
  try {
    const complaints = await Complaint.find({ department }).sort({ createdAt: -1 });
    console.log(`Found ${complaints.length} complaints for department: ${department}`);
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    console.log(`Returning all ${complaints.length} complaints`);
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

// Get complaints by student ID
const getComplaintsByStudentId = async (req, res) => {
  const { studentId } = req.params;
  try {
    const complaints = await Complaint.find({ studentId }).sort({ createdAt: -1 });
    console.log(`Found ${complaints.length} complaints for student: ${studentId}`);
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching student complaints:", error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

module.exports = {
  submitComplaint,
  getComplaintsByDepartment,
  getAllComplaints,
  getComplaintsByStudentId
};