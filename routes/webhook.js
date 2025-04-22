const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Public routes for chatbot
router.post('/', whatsappController.handleIncoming);

module.exports = router;
