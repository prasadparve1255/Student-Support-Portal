const errorHandler = (err, req, res, next) => {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, error: messages.join(', ') });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(400).json({ success: false, error: `${field} already exists` });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;