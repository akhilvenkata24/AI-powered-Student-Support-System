const express = require('express');
const router = express.Router();
const validate = require('../middleware/validation');
const { requireAdminAuth } = require('../middleware/adminAuth');
const { adminLoginSchema } = require('../middleware/schemas');
const { loginAdmin, getCurrentAdmin } = require('../controllers/adminAuthController');

router.post('/login', validate(adminLoginSchema), loginAdmin);
router.get('/me', requireAdminAuth, getCurrentAdmin);

module.exports = router;
