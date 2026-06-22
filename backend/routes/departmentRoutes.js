const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, isAdmin, isMainAdmin } = require('../middleware/auth');

// Public route for getting departments
router.get('/', departmentController.getAllDepartments);

// Only Main Admin can create departments
router.post('/', verifyToken, isMainAdmin, departmentController.createDepartment);

router.route('/:id')
    .get(verifyToken, isAdmin, departmentController.getDepartmentById)
    .put(verifyToken, isMainAdmin, departmentController.updateDepartment)
    .delete(verifyToken, isMainAdmin, departmentController.deleteDepartment);

module.exports = router;