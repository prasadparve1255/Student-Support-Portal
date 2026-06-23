const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Student = require("../models/Student");

// Check if setup is needed (no admin exists)
exports.checkSetup = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({ needsSetup: adminCount === 0 });
  } catch (error) {
    res.status(500).json({ message: 'Setup check failed' });
  }
};

// Create first Main Admin (only works if no admin exists)
exports.setupAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({ message: 'Setup already complete' });
    }
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const admin = new Admin({
      name, username, email, password,
      isMainAdmin: true,
      role: 'MAIN_ADMIN'
    });
    await admin.save();
    res.status(201).json({ message: 'Main Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Setup failed', error: error.message });
  }
};

// Generate JWT token
const generateToken = (id, role, isMainAdmin = false, department = null) => {
  return jwt.sign(
    {
      id,
      role,
      isMainAdmin,
      department,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
};

// // Admin login
// exports.adminLogin = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Check if admin exists
//     const admin = await Admin.findOne({ username }).populate('department', 'name');
//     if (!admin) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await admin.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Generate token
//     const token = generateToken(admin._id, 'admin', admin.isMainAdmin);

//     // department can be ObjectId or populated object — always send string
//     const departmentName = admin.isMainAdmin
//       ? 'All Departments'
//       : (admin.department?.name || String(admin.department || ''));

//     res.status(200).json({
//       token,
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         username: admin.username,
//         email: admin.email,
//         department: departmentName,
//         isMainAdmin: admin.isMainAdmin,
//         role: admin.isMainAdmin ? 'MAIN_ADMIN' : 'DEPARTMENT_ADMIN'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Login failed', error: error.message });
//   }
// };

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim(),
    }).populate("department", "name");

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = generateToken(
      admin._id,
      "admin",
      admin.isMainAdmin,
      admin.department?._id || admin.department,
    );

    res.status(200).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        department: admin.isMainAdmin
          ? "All Departments"
          : admin.department?.name || "",
        isMainAdmin: admin.isMainAdmin,
        role: admin.isMainAdmin ? "MAIN_ADMIN" : "DEPARTMENT_ADMIN",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};
// Student login
exports.studentLogin = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ studentId })
      .populate("department", "name code")
      .populate("class", "name");
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(student._id, "student");

    res.status(200).json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        department:
          student.department?.name || String(student.department || ""),
        class: student.class ? { name: student.class.name, _id: student.class._id } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get user", error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Current and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const role = req.user.role;
    const userId = req.user._id || req.user.id;
    const isAdminRole = ["MAIN_ADMIN", "DEPARTMENT_ADMIN"].includes(role);

    if (isAdminRole) {
      const admin = await Admin.findById(userId);
      if (!admin) return res.status(404).json({ message: "Admin not found" });
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch)
        return res.status(400).json({ message: "Current password is incorrect" });
      admin.password = newPassword;
      await admin.save();
    } else {
      const student = await Student.findById(userId);
      if (!student)
        return res.status(404).json({ message: "Student not found" });
      const isMatch = await bcrypt.compare(currentPassword, student.password);
      if (!isMatch)
        return res.status(400).json({ message: "Current password is incorrect" });
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(newPassword, salt);
      student.markModified('password');
      await student.save({ validateModifiedOnly: true });
    }

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};
