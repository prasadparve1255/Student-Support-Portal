const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST / requires admin token - only admins can register students
router.post('/', verifyToken, isAdmin, studentController.registerStudent);

// Protected routes for getting students
router.get('/', verifyToken, isAdmin, studentController.getStudents);
router.get('/:id', verifyToken, isAdmin, studentController.getStudentById);
router.put('/:id', verifyToken, isAdmin, studentController.updateStudent);
router.put('/:id/reset-password', verifyToken, isAdmin, studentController.resetStudentPassword);
router.delete('/:id', verifyToken, isAdmin, studentController.deleteStudent);

module.exports = router;