const StudentQuery = require('../models/StudentQuery');
const FAQ = require('../models/FAQ');
const CounselingAppointment = require('../models/CounselingAppointment');
const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/apiResponse');

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
            notes: `Reason: ${reason} | Contact Email: ${email}`
        });
        await newAppointment.save();
        sendSuccess(res, newAppointment, 201);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getQueries,
    getFAQs,
    createFAQ,
    getAppointments,
    createAppointment
};
