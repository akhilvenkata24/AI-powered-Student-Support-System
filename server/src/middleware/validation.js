const Joi = require('joi');
const { sendError } = require('../utils/apiResponse');

/**
 * Higher-order function to validate request body against a Joi schema
 */
const validate = (schema) => (req, res, next) => {
    if (!schema) return next();

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(d => d.message).join(', ');
        return sendError(res, 'Validation Failed', 400, errorMessages);
    }

    next();
};

module.exports = validate;
