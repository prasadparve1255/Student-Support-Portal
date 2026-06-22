const express = require('express');
const router = express.Router();
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdmin, getClasses);
router.post('/', verifyToken, isAdmin, createClass);
router.put('/:id', verifyToken, isAdmin, updateClass);
router.delete('/:id', verifyToken, isAdmin, deleteClass);

module.exports = router;
