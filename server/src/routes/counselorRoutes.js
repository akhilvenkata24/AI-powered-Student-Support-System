const express = require('express');
const { askCounselor } = require('../controllers/counselorController');

const router = express.Router();

router.post('/ask', askCounselor);

module.exports = router;
