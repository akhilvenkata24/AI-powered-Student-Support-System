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

const WORKING_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

const formatSlotLabel = (time) => {
    const hour = parseInt(time.split(':')[0], 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const display = hour > 12 ? hour - 12 : hour;
    return `${display}:00 ${suffix}`;
};

/**
 * @desc    Get available slots for a given date (public)
 */
const getSlots = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return sendError(res, 'Valid date (YYYY-MM-DD) is required.', 400);
        }
        const dayOfWeek = new Date(date + 'T00:00:00.000Z').getUTCDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return sendError(res, 'Counseling is not available on weekends.', 400);
        }
        const booked = await CounselingAppointment.find({
            dateString: date,
            status: 'scheduled',
        }).select('slotTime');
        const bookedTimes = new Set(booked.map((a) => a.slotTime));
        const slots = WORKING_SLOTS.map((time) => ({
            time,
            label: formatSlotLabel(time),
            available: !bookedTimes.has(time),
        }));
        sendSuccess(res, { date, slots });
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
        const { studentId, email, appointmentDate, slotTime, reason } = req.body;

        // Validate working day (Mon–Fri)
        const dayOfWeek = new Date(appointmentDate + 'T00:00:00.000Z').getUTCDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return sendError(res, 'Appointments can only be booked on working days (Monday–Friday).', 400);
        }

        // Validate slot time
        if (!WORKING_SLOTS.includes(slotTime)) {
            return sendError(res, 'Invalid slot. Working hours are 9 AM – 4 PM.', 400);
        }

        // Check slot is not already taken
        const conflict = await CounselingAppointment.findOne({
            dateString: appointmentDate,
            slotTime,
            status: 'scheduled',
        });
        if (conflict) {
            return sendError(res, 'This slot is already booked. Please choose another.', 409);
        }

        // Find student
        const User = require('../models/User');
        const user = await User.findOne({ externalId: studentId.trim().toUpperCase() });
        if (!user) {
            return sendError(res, 'Student ID not found. Please check your ID and try again.', 404);
        }

        // Map reason to type enum
        let type = 'mental_health_therapy';
        if (reason === 'academic') type = 'academic_advising';
        if (reason === 'career') type = 'career_services';

        const newAppointment = new CounselingAppointment({
            studentId: user._id,
            counselorName: 'Assigned Counselor',
            appointmentDate: new Date(`${appointmentDate}T${slotTime}:00.000Z`),
            dateString: appointmentDate,
            slotTime,
            type,
            mode: 'virtual',
            status: 'scheduled',
            contactEmail: email,
            requestReason: reason,
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
    getSlots,
    getAppointments,
    createAppointment,
    updateAppointmentFlag
};
