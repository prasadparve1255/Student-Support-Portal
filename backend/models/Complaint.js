const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, default: '' },
  department: { type: String, required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  class: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  adminResponse: { type: String, default: '' },
  attachments: [{ type: String }],
  isNotification: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
