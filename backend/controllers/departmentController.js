const Department = require('../models/Department');
const Admin = require("../models/Admin");
const { sendDepartmentAdminWelcomeEmail } = require('../utils/emailService');

// Get all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort('name');
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      adminName,
      username,
      email,
      password,
    } = req.body;

    // Department already exists?
    const existingDepartment = await Department.findOne({
      $or: [{ name }, { code }],
    });

    if (existingDepartment) {
      return res.status(400).json({
        message: "Department already exists",
      });
    }

    // Admin username already exists?
    const existingUsername = await Admin.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    // Admin email already exists?
    const existingEmail = await Admin.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Create Department
    const department = new Department({
      name,
      code,
      description,
    });

    await department.save();

    // Create Department Admin
    const admin = new Admin({
      name: adminName,
      username,
      email,
      password,
      department: department._id,
      role: "DEPARTMENT_ADMIN",
      isMainAdmin: false,
    });

    await admin.save();

    // Send welcome email to new Department Admin
    try {
      await sendDepartmentAdminWelcomeEmail({
        name: admin.name,
        email: admin.email,
        username: admin.username,
        password: password,
        department: department.name,
      });
    } catch (emailErr) {
      console.error('Admin email failed:', emailErr.message);
    }

    res.status(201).json({
      message: "Department and Department Admin created successfully",
      department,
      admin: {
        _id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      message: "Error creating department",
      error: error.message,
    });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department', error: error.message });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        res.status(400).json({ message: 'Error updating department', error: error.message });
    }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    }
};