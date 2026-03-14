/**
 * Unified API Response Helper
 */
const sendSuccess = (res, data, status = 200) => {
    res.status(status).json({
        success: true,
        data
    });
};

const sendError = (res, message, status = 500, errors = null) => {
    const response = {
        success: false,
        error: message
    };
    if (errors) response.details = errors;
    res.status(status).json(response);
};

module.exports = {
    sendSuccess,
    sendError
};
