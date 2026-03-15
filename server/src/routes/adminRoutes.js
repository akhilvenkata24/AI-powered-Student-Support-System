const express = require('express');
const router = express.Router();
const {
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
router.get('/appointments/slots', getSlots); // public — no auth needed
router.get('/appointments', requireAdminAuth, getAppointments);
router.get('/appointments/export', requireAdminAuth, exportScheduledAppointments);
router.post('/appointments', validate(appointmentSchema), createAppointment);
router.patch('/appointments/:appointmentId/flag', requireAdminAuth, updateAppointmentFlag);
router.delete('/appointments/:appointmentId', requireAdminAuth, deleteAppointment);

module.exports = router;
