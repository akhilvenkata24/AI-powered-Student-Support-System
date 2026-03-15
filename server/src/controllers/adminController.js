const StudentQuery = require('../models/StudentQuery');
const FAQ = require('../models/FAQ');
const CounselingAppointment = require('../models/CounselingAppointment');
const reportService = require('../services/reportService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await reportService.getDashboardStats();
        sendSuccess(res, stats);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all recent student queries
 */
const getQueries = async (req, res, next) => {
    try {
        const queries = await reportService.getRecentQueries();
        sendSuccess(res, queries);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all FAQs
 */
const getFAQs = async (req, res, next) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        sendSuccess(res, faqs);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new FAQ
 */
const createFAQ = async (req, res, next) => {
    try {
        const { question, answer, category, tags } = req.body;
        const newFaq = new FAQ({ question, answer, category, tags });
        await newFaq.save();
        sendSuccess(res, newFaq, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update an existing FAQ
 */
const updateFAQ = async (req, res, next) => {
    try {
        const { faqId } = req.params;
        const { question, answer, category, tags } = req.body;

        const faq = await FAQ.findById(faqId);
        if (!faq) {
            return sendError(res, 'FAQ not found.', 404);
        }

        faq.question = question;
        faq.answer = answer;
        faq.category = category;
        faq.tags = tags || [];
        await faq.save();

        sendSuccess(res, faq);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete an FAQ
 */
const deleteFAQ = async (req, res, next) => {
    try {
        const { faqId } = req.params;
        const faq = await FAQ.findById(faqId);

        if (!faq) {
            return sendError(res, 'FAQ not found.', 404);
        }

        await faq.deleteOne();
        sendSuccess(res, { id: faqId });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get counseling appointments
 */
const getAppointments = async (req, res, next) => {
    try {
        const appointments = await CounselingAppointment.find()
            .populate('studentId', 'name email externalId')
            .sort({ appointmentDate: 1 });
        sendSuccess(res, appointments);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new counseling appointment
 */
const createAppointment = async (req, res, next) => {
    try {
        const { studentId, appointmentDate, reason, email } = req.body;
        
        // Find the user to validate the studentId
        const User = require('../models/User');
        let user = await User.findOne({ externalId: studentId });
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Student ID. Student not found.' });
        }

        // Map reason to valid type enum
        let type = 'mental_health_therapy';
        if (reason === 'Academic Support') type = 'academic_advising';
        if (reason === 'Career Anxiety') type = 'career_services';

        const newAppointment = new CounselingAppointment({
            studentId: user._id,
            counselorName: 'Assigned Counselor', // Default since UI doesn't collect this
            appointmentDate,
            type,
            mode: 'virtual', // Default
            status: 'scheduled', 
            contactEmail: email,
            requestReason: reason,
            notes: `Reason: ${reason} | Contact Email: ${email}`
        });
        await newAppointment.save();
        sendSuccess(res, newAppointment, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Flag or unflag an appointment for admin review
 */
const updateAppointmentFlag = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { flaggedForReview } = req.body;

        if (typeof flaggedForReview !== 'boolean') {
            return sendError(res, 'flaggedForReview must be a boolean.', 400);
        }

        const appointment = await CounselingAppointment.findById(appointmentId)
            .populate('studentId', 'name email externalId');

        if (!appointment) {
            return sendError(res, 'Appointment not found.', 404);
        }

        appointment.flaggedForReview = flaggedForReview;
        await appointment.save();

        sendSuccess(res, appointment);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getQueries,
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    getAppointments,
    createAppointment,
    updateAppointmentFlag
};
