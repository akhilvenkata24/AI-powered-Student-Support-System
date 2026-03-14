const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getQueries, 
    getFAQs, 
    createFAQ, 
    getAppointments,
    createAppointment
} = require('../controllers/adminController');
const validate = require('../middleware/validation');
const { faqSchema, appointmentSchema } = require('../middleware/schemas');

router.get('/stats', getDashboardStats);
router.get('/queries', getQueries);
router.get('/faqs', getFAQs);
router.post('/faqs', validate(faqSchema), createFAQ);
router.get('/appointments', getAppointments);
router.post('/appointments', validate(appointmentSchema), createAppointment);

module.exports = router;
