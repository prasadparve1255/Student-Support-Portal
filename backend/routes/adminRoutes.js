const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', adminController.loginAdmin);

// Protected routes
router.route('/profile')
    .get(protect, adminController.getAdminProfile)
    .put(protect, adminController.updateAdminProfile);

// Admin only routes
router.route('/')
    .post(protect, admin, adminController.registerAdmin)
    .get(protect, admin, adminController.getAdmins);

router.route('/:id')
    .delete(protect, admin, adminController.deleteAdmin);

module.exports = router;