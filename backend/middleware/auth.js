const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Add user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'student'
        };
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized - Invalid token'
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - No user found'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - Insufficient permissions'
            });
        }

        next();
    };
};

const isMainAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin' || !req.user.isMainAdmin) {
        return res.status(403).json({
            success: false,
            error: 'Forbidden - Main admin access required'
        });
    }
    next();
};

const isDepartmentAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Forbidden - Department admin access required'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    requireRole,
    isMainAdmin,
    isDepartmentAdmin
};