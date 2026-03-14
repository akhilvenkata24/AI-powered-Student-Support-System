const Joi = require('joi');

const chatSchema = Joi.object({
    question: Joi.string().required().min(3),
    language: Joi.string().optional().default('English'),
    studentId: Joi.string().required(), // Now required for identity mapping
    category: Joi.string().optional().default('general')
});

const faqSchema = Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional()
});

const appointmentSchema = Joi.object({
    studentId: Joi.string().required(),
    email: Joi.string().email().required(),
    appointmentDate: Joi.date().iso().required(),
    reason: Joi.string().required()
});

module.exports = {
    chatSchema,
    faqSchema,
    appointmentSchema
};
