const express = require('express');
const router = express.Router();
const { getProfile, verifyAdmissionDocument } = require('../controllers/userController');

router.get('/profile/:externalId', getProfile);
router.post('/verify-document', verifyAdmissionDocument);

module.exports = router;
