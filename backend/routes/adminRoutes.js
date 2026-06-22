const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin, isMainAdmin } = require('../middleware/auth');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const Class = require('../models/Class');
const fs = require('fs');
const path = require('path');

// Routes require auth - admins only
router.post('/register-student', verifyToken, isMainAdmin, adminController.registerStudent);
router.post('/register-department-admin', verifyToken, isMainAdmin, adminController.registerDepartmentAdmin);
router.get('/', verifyToken, isMainAdmin, adminController.getAdmins);
router.get('/:id', verifyToken, isMainAdmin, adminController.getAdminById);

// Backup route — file download + DBBackup folder मध्ये save
router.get('/backup/download', verifyToken, isAdmin, async (req, res) => {
  try {
    const isMain = req.user.role === 'MAIN_ADMIN';
    const deptId = req.user.department?._id || req.user.department;
    const deptName = req.user.department?.name || '';

    const deptQuery = isMain ? {} : { department: deptId };
    const complaintQuery = isMain ? {} : { department: deptName };

    const [admins, students, departments, complaints, classes] = await Promise.all([
      isMain ? Admin.find().select('-password').lean() : [],
      Student.find(deptQuery).select('-password').lean(),
      isMain ? Department.find().lean() : Department.find({ _id: deptId }).lean(),
      Complaint.find(complaintQuery).lean(),
      Class.find(isMain ? {} : { department: deptId }).lean(),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.username || req.user.name,
      role: req.user.role,
      department: isMain ? 'All Departments' : deptName,
      counts: {
        students: students.length,
        complaints: complaints.length,
        departments: departments.length,
        classes: classes.length,
        ...(isMain && { admins: admins.length }),
      },
      ...(isMain && { admins }),
      students,
      departments,
      complaints,
      classes,
    };

    const date = new Date().toISOString().slice(0, 10);
    const time = new Date().toTimeString().slice(0, 8).replace(/:/g, '-');
    const filename = isMain
      ? `backup-full-${date}_${time}.json`
      : `backup-${deptName.replace(/\s+/g, '-')}-${date}_${time}.json`;

    // backups folder मध्ये save करा — backend/backups/
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const filePath = path.join(backupDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Backup saved to backend/backups/${filename}`);

    // Browser ला download पण करा
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ message: 'Backup failed', error: err.message });
  }
});

module.exports = router;