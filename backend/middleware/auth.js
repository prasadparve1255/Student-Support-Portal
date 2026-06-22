const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/Student");

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authentication token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id)
        .select("-password")
        .populate("department", "name code");
      if (!admin) {
        return res.status(401).json({
          message: "Admin not found",
        });
      }
      req.user = {
        ...admin.toObject(),
        role: decoded.isMainAdmin ? "MAIN_ADMIN" : "DEPARTMENT_ADMIN",
      };
    } else {
      const student = await Student.findById(decoded.id).select("-password");
      if (!student) {
        return res.status(401).json({ message: "Student not found" });
      }
      req.user = {
        ...student.toObject(),
        role: "student",
      };
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// Check if user is an admin
const isAdmin = (req, res, next) => {
  if (
    !req.user ||
    !["MAIN_ADMIN", "DEPARTMENT_ADMIN"].includes(req.user.role)
  ) {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

// Check if user is a main admin
const isMainAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "MAIN_ADMIN") {
    return res
      .status(403)
      .json({ message: "Access denied. Main admin privileges required." });
  }
  next();
};

// Check if user is a department admin
const isDepartmentAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "DEPARTMENT_ADMIN") {
    return res.status(403).json({
      message: "Access denied. Department admin privileges required.",
    });
  }
  next();
};

// Check if user is a student
const isStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Access denied. Student privileges required." });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isMainAdmin,
  isDepartmentAdmin,
  isStudent,
};
