const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route for getting departments
router.get('/', departmentController.getAllDepartments);

// Protected admin routes
router.post('/', protect, admin, departmentController.createDepartment);

router.route('/:id')
    .get(protect, admin, departmentController.getDepartmentById)
    .put(protect, admin, departmentController.updateDepartment)
    .delete(protect, admin, departmentController.deleteDepartment);

module.exports = router;