const Student = require('../models/Student');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');

// Register new student
exports.registerStudent = async (req, res) => {
    try {
        const { name, email, studentId, departmentId, password } = req.body;
        
        // Check if department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
            $or: [{ email }, { studentId }] 
        });
        if (existingStudent) {
            return res.status(400).json({ 
                message: 'Student with this email or ID already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const student = new Student({
            name,
            email,
            studentId,
            department: departmentId,
            password: hashedPassword,
            createdBy: req.user._id, // Assuming admin user is in request
            registrationSource: req.user.role === 'DEPARTMENT_ADMIN' ? 'DEPARTMENT_DASHBOARD' : 'MANI_ADMIN'
        });

        await student.save();
        
        // Remove password from response
        const studentResponse = student.toObject();
        delete studentResponse.password;
        
        res.status(201).json(studentResponse);
    } catch (error) {
        res.status(400).json({ message: 'Error registering student', error: error.message });
    }
};

// Get all students (with optional department and source filters)
exports.getStudents = async (req, res) => {
    try {
        const { departmentId, registrationSource } = req.query;
        const query = {};
        
        if (departmentId) {
            query.department = departmentId;
        }
        
        if (registrationSource) {
            query.registrationSource = registrationSource;
        }
        
        const students = await Student.find(query)
            .select('-password')
            .populate('department', 'name code')
            .sort('name');
            
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .select('-password')
            .populate('department', 'name code');
            
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student', error: error.message });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(400).json({ message: 'Error updating student', error: error.message });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
};