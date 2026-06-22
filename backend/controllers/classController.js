const Class = require('../models/Class');
const mongoose = require('mongoose');

// Helper — department चा ObjectId safely काढणे
const getDeptId = (dept) => {
  if (!dept) return null;
  if (typeof dept === 'object' && dept._id) return dept._id.toString();
  return dept.toString();
};

// Get classes
exports.getClasses = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'DEPARTMENT_ADMIN' && req.user.department) {
      query.department = getDeptId(req.user.department);
    } else if (req.query.department) {
      // validate before casting
      if (!mongoose.Types.ObjectId.isValid(req.query.department)) {
        return res.json([]);
      }
      query.department = req.query.department;
    }

    const classes = await Class.find(query)
      .populate('department', 'name code')
      .sort({ name: 1 });

    res.json(classes);
  } catch (error) {
    console.error('getClasses error:', error);
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

// Create class — Department Admin only
exports.createClass = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    if (req.user.role !== 'DEPARTMENT_ADMIN') {
      return res.status(403).json({ message: 'Only Department Admins can create classes' });
    }

    const departmentId = getDeptId(req.user.department);
    if (!departmentId) {
      return res.status(400).json({ message: 'Department not assigned to this admin' });
    }

    // Duplicate check
    const existing = await Class.findOne({
      name: name.trim(),
      department: departmentId,
    });
    if (existing) {
      return res.status(400).json({ message: `Class "${name.trim()}" already exists in this department` });
    }

    const newClass = await Class.create({
      name: name.trim(),
      department: departmentId,
      description: description ? description.trim() : '',
    });

    const populated = await Class.findById(newClass._id).populate('department', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    console.error('createClass error:', error);
    res.status(500).json({ message: 'Error creating class', error: error.message });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    if (req.user.role === 'DEPARTMENT_ADMIN') {
      const deptId = getDeptId(req.user.department);
      if (classDoc.department.toString() !== deptId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (name && name.trim()) classDoc.name = name.trim();
    if (description !== undefined) classDoc.description = description.trim();
    await classDoc.save();

    const populated = await Class.findById(classDoc._id).populate('department', 'name code');
    res.json(populated);
  } catch (error) {
    console.error('updateClass error:', error);
    res.status(500).json({ message: 'Error updating class', error: error.message });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    if (req.user.role === 'DEPARTMENT_ADMIN') {
      const deptId = getDeptId(req.user.department);
      if (classDoc.department.toString() !== deptId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await classDoc.deleteOne();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('deleteClass error:', error);
    res.status(500).json({ message: 'Error deleting class', error: error.message });
  }
};
