const Student = require("../models/Student");
const Department = require("../models/Department");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  sendRegistrationEmail,
  sendAdminNotificationEmail,
} = require("../utils/emailService");
const Admin = require("../models/Admin");

// Allowed fields for student update (prevent mass assignment)
const ALLOWED_UPDATE_FIELDS = ["name", "email", "status", "class"];

// Register new student
exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      departmentId,
      department: deptField,
      password,
      classId,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const nameRegex = /^[A-Za-z\s\u0900-\u097F'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return res
        .status(400)
        .json({ message: "Name should contain only letters and spaces" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    const finalDepartmentId = departmentId || deptField;

    // Find department by ObjectId first, fall back to name
    let departmentDoc;
    if (finalDepartmentId) {
      try {
        departmentDoc = await Department.findById(finalDepartmentId);
      } catch (err) {
        // Not a valid ObjectId, will try by name below
      }
      if (!departmentDoc) {
        departmentDoc = await Department.findOne({
          name: String(finalDepartmentId),
        });
      }
    }

    if (!departmentDoc) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Auto-generate studentId: YYDeptCodeCounter e.g. 24CS01
    const year = new Date().getFullYear().toString().slice(-2);
    const deptCode = departmentDoc.code?.toUpperCase().slice(0, 2) || "ST";
    const prefix = `${year}${deptCode}`;
    // Safe: prefix is constructed from controlled values only, not user input
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lastStudent = await Student.findOne({
      studentId: new RegExp(`^${escapedPrefix}`),
    }).sort({ studentId: -1 });
    let counter = 1;
    if (lastStudent) {
      const lastNum = parseInt(lastStudent.studentId.slice(prefix.length), 10);
      if (!isNaN(lastNum)) counter = lastNum + 1;
    }
    const finalStudentId = `${prefix}${counter.toString().padStart(2, "0")}`;

    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const student = new Student({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      studentId: finalStudentId,
      department: departmentDoc._id,
      class: classId || null,
      password,
      createdBy: req.user ? req.user._id : null,
      registrationSource:
        req.user && req.user.role === "DEPARTMENT_ADMIN"
          ? "DEPARTMENT_DASHBOARD"
          : "MAIN_ADMIN",
    });

    await student.save();

    // class name fetch करा email साठी
    let className = null;
    if (classId) {
      try {
        const Class = require('../models/Class');
        const classDoc = await Class.findById(classId).select('name');
        if (classDoc) className = classDoc.name;
      } catch (e) { /* ignore */ }
    }

    // Email pathav (5 sec timeout - jast vel nahi lagar)
    const emailPromise = sendRegistrationEmail({
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      originalPassword: password,
      department: departmentDoc.name,
      className,
    }).catch(e => console.error('Registration email failed:', e.message));

    const timeout = new Promise(resolve => setTimeout(resolve, 5000));
    await Promise.race([emailPromise, timeout]);

    res.status(201).json({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: departmentDoc.name,
      _id: student._id,
    });

  } catch (error) {
    console.error("Student registration error:", error);
    res.status(400).json({
      message: "Error registering student",
      error: error.message,
    });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    let query = {};

    // Department Admin → फक्त स्वतःच्या department चे students
    if (req.user.role === "DEPARTMENT_ADMIN" && req.user.department) {
      const deptId = req.user.department._id
        ? req.user.department._id.toString()
        : req.user.department.toString();
      query.department = new mongoose.Types.ObjectId(deptId);
    }

    const students = await Student.find(query)
      .select("-password")
      .populate("department", "name code")
      .populate("class", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .select("-password")
      .populate("department", "name code")
      .populate("class", "name");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student" });
  }
};

// Update student - only allow safe fields (prevent mass assignment)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Only apply allowed fields to prevent mass assignment of password hash, studentId, department, etc.
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    Object.assign(student, updates);
    await student.save();

    console.log("Student saved successfully:", student.studentId);

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(200).json(studentResponse);
  } catch (error) {
    res.status(400).json({ message: "Error updating student" });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student" });
  }
};

// Admin reset student password
exports.resetStudentPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    // findByIdAndUpdate वापरतो — pre-save hook bypass
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await Student.findByIdAndUpdate(req.params.id, { password: hashed });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};
