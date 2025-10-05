const express = require('express');
const router = express.Router();
const controller = require('../controllers/certificateController');

// Public verification route: fetch by serial
router.get('/:serialNumber', controller.getCertificateBySerial);

module.exports = router;
