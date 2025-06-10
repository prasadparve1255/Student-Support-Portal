const { auth } = require('../config/firebaseAdmin');
const Admin = require('../models/Admin');
const Student = require('../models/Student');

exports.protect = async (req, res, next) => {
    try {
        // Check for authorization header
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Get token from header
        const token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decodedToken = await auth.verifyIdToken(token);
        
        // Get user from token
        const user = await auth.getUser(decodedToken.uid);

        // Check if user exists in our database
        let userDoc;
        if (decodedToken.admin) {
            userDoc = await Admin.findById(user.uid);
            req.user = { ...userDoc, role: 'admin' };
        } else {
            userDoc = await Student.findById(user.uid);
            req.user = { ...userDoc, role: 'student' };
        }

        if (!userDoc) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.admin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role === 'admin') {
            return res.status(401).json({ message: 'Not authorized as admin' });
        }
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(401).json({ message: 'Not authorized as admin' });
    }
};

exports.mainAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role === 'admin' || !req.user.isMainAdmin) {
            return res.status(401).json({ message: 'Not authorized as main admin' });
        }
        next();
    } catch (error) {
        console.error('Main admin middleware error:', error);
        res.status(401).json({ message: 'Not authorized as main admin' });
    }
};

exports.student = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role === 'student') {
            return res.status(401).json({ message: 'Not authorized as student' });
        }
        next();
    } catch (error) {
        console.error('Student middleware error:', error);
        res.status(401).json({ message: 'Not authorized as student' });
    }
};