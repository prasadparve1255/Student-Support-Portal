const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

// Unique class name per department
ClassSchema.index({ name: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Class', ClassSchema);
