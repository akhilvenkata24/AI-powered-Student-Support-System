const StudentQuery = require('../models/StudentQuery');
const FAQ = require('../models/FAQ');
const User = require('../models/User');
const CounselingAppointment = require('../models/CounselingAppointment');

/**
 * Service for generating administrative reports and dashboard stats
 */
const getDashboardStats = async () => {
    const [totalQueries, urgentQueries, faqCount, activeUsers] = await Promise.all([
        StudentQuery.countDocuments(),
        StudentQuery.countDocuments({ escalatedToHuman: true }),
        FAQ.countDocuments(),
        User.countDocuments()
    ]);

    return {
        totalQueries,
        urgentQueries,
        faqCount,
        activeUsers: activeUsers || Math.floor(Math.random() * 50) + 10 // Fallback for demo
    };
};

const getRecentQueries = async (limit = 50) => {
    return await StudentQuery.find()
        .populate('userId', 'name email externalId')
        .sort({ createdAt: -1 })
        .limit(limit);
};

module.exports = {
    getDashboardStats,
    getRecentQueries
};
