const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');
const validate = require('../middleware/validation');
const { chatSchema } = require('../middleware/schemas');

router.post('/', validate(chatSchema), handleChat);

module.exports = router;
