const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Firebase Auth errors
    if (err.code && err.code.startsWith('auth/')) {
        return res.status(401).json({
            success: false,
            error: err.message
        });
    }

    // Firestore errors
    if (err.code && err.code.startsWith('firestore/')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Storage errors
    if (err.code && err.code.startsWith('storage/')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // SendGrid errors
    if (err.code && err.code === 'SENDGRID_ERROR') {
        return res.status(500).json({
            success: false,
            error: 'Error sending email notification'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;