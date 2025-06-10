const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected admin routes
router.use(protect, admin);

router.route('/')
    .get(studentController.getStudents)
    .post(studentController.registerStudent);

router.route('/:id')
    .get(studentController.getStudentById)
    .put(studentController.updateStudent)
    .delete(studentController.deleteStudent);

module.exports = router;