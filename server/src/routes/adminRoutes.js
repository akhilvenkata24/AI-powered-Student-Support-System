const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getQueries,
    getFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    getAppointments,
    createAppointment,
    updateAppointmentFlag
} = require('../controllers/adminController');
const validate = require('../middleware/validation');
const { requireAdminAuth } = require('../middleware/adminAuth');
const { faqSchema, appointmentSchema } = require('../middleware/schemas');

router.get('/stats', requireAdminAuth, getDashboardStats);
router.get('/queries', requireAdminAuth, getQueries);
router.get('/faqs', requireAdminAuth, getFAQs);
router.post('/faqs', requireAdminAuth, validate(faqSchema), createFAQ);
router.put('/faqs/:faqId', requireAdminAuth, validate(faqSchema), updateFAQ);
router.delete('/faqs/:faqId', requireAdminAuth, deleteFAQ);
router.get('/appointments', requireAdminAuth, getAppointments);
router.post('/appointments', validate(appointmentSchema), createAppointment);
router.patch('/appointments/:appointmentId/flag', requireAdminAuth, updateAppointmentFlag);

module.exports = router;
