const { sendError } = require('../utils/apiResponse');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.name}: ${err.message}`);
    
    // Default error status and message
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific mongoose errors
    if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.code === 11000) {
        status = 400;
        message = 'Duplicate field value entered';
    } else if (err.name === 'CastError') {
        status = 404;
        message = `Resource not found with id of ${err.value}`;
    }

    sendError(res, message, status);
};

module.exports = errorHandler;
