const express = require('express');
const { adminLogin, studentLogin, getCurrentUser, changePassword, checkSetup, setupAdmin } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.get('/setup/check', checkSetup);
router.post('/setup', setupAdmin);
router.post('/admin/login', adminLogin);
router.post('/student/login', studentLogin);
router.get('/me', verifyToken, getCurrentUser);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;