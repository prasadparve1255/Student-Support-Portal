const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const {
  sendRegistrationEmail,
  sendAdminNotificationEmail,
} = require("../utils/emailService");

// Register a new student (by admin)
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, studentId, departmentId, department, password } =
      req.body;

    const finalDepartmentId = departmentId || department;

    // Check if department exists
    const departmentDoc = await Department.findById(finalDepartmentId);

    if (!departmentDoc) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }],
    });
    if (existingStudent) {
      return res.status(400).json({
        message: "Student with this email or ID already exists",
      });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      studentId,
      department: departmentDoc._id,
      password, // Will be hashed by the pre-save hook in the Student model
      createdBy: req.user ? req.user._id : null,
      registrationSource:
        req.user?.role === "DEPARTMENT_ADMIN"
          ? "DEPARTMENT_DASHBOARD"
          : "MAIN_ADMIN",
    });

    // Save student to database
    await student.save();

    const departmentName = departmentDoc.name;

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    // Email pathav (background madhe, response block n karta)
    sendRegistrationEmail({
      name,
      email,
      studentId,
      department: departmentName,
      originalPassword: password,
    }).catch(e => console.error('Student email failed:', e.message));

    res.status(201).json({
      ...studentResponse,
      studentEmailSent: true,
      adminEmailSent: true,
    });

    // Admin notification background madhe
    Admin.findOne({ isMainAdmin: true }).then(admin => {
      if (admin?.email) {
        sendAdminNotificationEmail({
          student: { name, email, studentId, department: departmentName },
          admin: { name: admin.name, username: admin.username, email: admin.email },
        }).catch(e => console.error('Admin email failed:', e.message));
      }
    });

  } catch (error) {
    console.error("Error registering student:", error);
    res.status(400).json({ message: "Error registering student", error: error.message });
  }
};

// Register Department Admin
exports.registerDepartmentAdmin = async (req, res) => {
  try {
    const { name, username, email, password, departmentId } = req.body;

    if (!name || !username || !email || !password || !departmentId) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Department exists?
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // Username already exists?
    const existingUsername = await Admin.findOne({
      username: username.trim(),
    });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    // Email already exists?
    const existingEmail = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Create Department Admin
    const admin = new Admin({
      name,
      username,
      email,
      password,
      department: department._id,
      role: "DEPARTMENT_ADMIN",
      isMainAdmin: false,
    });

    await admin.save();

    await admin.populate("department", "name code");

    const response = admin.toObject();
    delete response.password;

    res.status(201).json({
      message: "Department admin created successfully",
      admin: response,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error creating department admin",
      error: error.message,
    });
  }
};

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .populate("department", "name code");
    res.status(200).json(admins);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select("-password")
      .populate("department", "name code");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching admin", error: error.message });
  }
};
