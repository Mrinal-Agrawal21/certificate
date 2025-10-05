const express = require('express');
const router = express.Router();
const controller = require('../controllers/certificateController');
const auth = require('../middleware/auth');

// Admin: create certificate
router.post('/certificate', auth, controller.createCertificate);

// Admin: list certificates
router.get('/certificates', auth, controller.listCertificates);

// Admin: generate and reserve next serial
router.get('/next-serial', auth, controller.nextSerial);

module.exports = router;
