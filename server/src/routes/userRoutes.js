const express = require('express');
const router = express.Router();
const { getProfile, validateStudent, verifyAdmissionDocument } = require('../controllers/userController');

router.get('/profile/:externalId', getProfile);
router.get('/validate/:externalId', validateStudent);
router.post('/verify-document', verifyAdmissionDocument);

module.exports = router;
