const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  name: {
  type: String,
  required: [true, 'Name is required'],
  trim: true,
  minlength: 3,
  match: [/^[A-Za-z\s]+$/, 'Name should contain only letters and spaces']
},
  email: {
  type: String,
  required: [true, 'Email is required'],
  unique: true,
  trim: true,
  lowercase: true,
  match: [
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'Please enter a valid email address'
  ]
},
  studentId: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  uppercase: true
},
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
status: {
  type: String,
  enum: ['ACTIVE', 'INACTIVE'],
  default: 'ACTIVE'
},
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  registrationSource: {
    type: String,
    enum: ['DEPARTMENT_DASHBOARD', 'MAIN_ADMIN'],
    default: 'MAIN_ADMIN'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
StudentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Hashing password for student:', this.name);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // console.log('Password hashed successfully');
    next();
  } catch (error) {
    // console.error('Password hashing error:', error);
    next(error);
  }
});

// Method to compare passwords
StudentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);