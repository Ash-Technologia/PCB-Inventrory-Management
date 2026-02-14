// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // PostgreSQL specific errors
    if (err.code === '23505') {
        // Unique constraint violation
        statusCode = 409;
        message = 'Duplicate entry: This record already exists';
    } else if (err.code === '23503') {
        // Foreign key violation
        statusCode = 400;
        message = 'Invalid reference: Related record not found';
    } else if (err.code === '23514') {
        // Check constraint violation
        statusCode = 400;
        message = 'Invalid data: Constraint violation';
    } else if (err.code === '22P02') {
        // Invalid text representation
        statusCode = 400;
        message = 'Invalid data format';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

// 404 Not Found handler
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};

module.exports = {
    errorHandler,
    notFound,
};
