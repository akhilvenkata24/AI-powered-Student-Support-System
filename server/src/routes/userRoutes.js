const express = require('express');
const router = express.Router();
const { getProfile, validateStudent, verifyAdmissionDocument, getAppointmentStatus } = require('../controllers/userController');

router.get('/profile/:externalId', getProfile);
router.get('/validate/:externalId', validateStudent);
router.get('/appointment-status/:externalId', getAppointmentStatus);
router.post('/verify-document', verifyAdmissionDocument);

module.exports = router;
