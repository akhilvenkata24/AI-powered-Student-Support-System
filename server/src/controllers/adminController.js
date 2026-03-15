const StudentQuery = require('../models/StudentQuery');
const FAQ = require('../models/FAQ');
const CounselingAppointment = require('../models/CounselingAppointment');
const reportService = require('../services/reportService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const COUNSELOR_POOL = [
    'Dr. Sarah Jenkins',
    'Dr. Michael Chen',
    'Dr. Aisha Rahman',
];

const getRandomCounselor = () => {
    const index = Math.floor(Math.random() * COUNSELOR_POOL.length);
    return COUNSELOR_POOL[index];
};

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
            counselorName: getRandomCounselor(),
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
 * @desc    Delete an appointment
 */
const deleteAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await CounselingAppointment.findById(appointmentId);

        if (!appointment) {
            return sendError(res, 'Appointment not found.', 404);
        }

        await appointment.deleteOne();
        sendSuccess(res, { id: appointmentId });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download scheduled appointments as document (CSV or TXT)
 */
const exportScheduledAppointments = async (req, res, next) => {
    try {
        const format = (req.query.format || 'csv').toString().toLowerCase();
        const scheduled = await CounselingAppointment.find({ status: 'scheduled' })
            .populate('studentId', 'name email externalId')
            .sort({ appointmentDate: 1 });

        const rows = scheduled.map((appointment) => ({
            studentId: appointment.studentId?.externalId || '',
            studentName: appointment.studentId?.name || '',
            studentEmail: appointment.studentId?.email || appointment.contactEmail || '',
            counselor: appointment.counselorName || '',
            date: appointment.dateString || appointment.appointmentDate?.toISOString().split('T')[0] || '',
            slot: appointment.slotTime || '',
            mode: appointment.mode || '',
            reason: appointment.requestReason || '',
            status: appointment.status || '',
            flaggedForReview: appointment.flaggedForReview ? 'yes' : 'no',
        }));

        if (format === 'txt') {
            const lines = [
                'Scheduled Appointments',
                `Generated At: ${new Date().toISOString()}`,
                '------------------------------------------------------------',
                ...rows.map((row, i) => (
                    `${i + 1}. ${row.studentName} (${row.studentId})\n` +
                    `   Email: ${row.studentEmail}\n` +
                    `   Counselor: ${row.counselor}\n` +
                    `   Date/Slot: ${row.date} ${row.slot}\n` +
                    `   Mode: ${row.mode}\n` +
                    `   Reason: ${row.reason}\n` +
                    `   Status: ${row.status}\n` +
                    `   Flagged: ${row.flaggedForReview}`
                )),
            ];

            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="scheduled-appointments.txt"');
            return res.status(200).send(lines.join('\n\n'));
        }

        const header = ['Student ID', 'Student Name', 'Student Email', 'Counselor', 'Date', 'Slot', 'Mode', 'Reason', 'Status', 'Flagged'];
        const csvRows = [
            header.join(','),
            ...rows.map((row) => [
                row.studentId,
                row.studentName,
                row.studentEmail,
                row.counselor,
                row.date,
                row.slot,
                row.mode,
                row.reason,
                row.status,
                row.flaggedForReview,
            ].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(',')),
        ];

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="scheduled-appointments.csv"');
        return res.status(200).send(csvRows.join('\n'));
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
    updateAppointmentFlag,
    deleteAppointment,
    exportScheduledAppointments
};
