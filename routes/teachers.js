'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/teacherController');
const { csrfProtect } = require('../middleware/csrf');
const { formLimiter } = require('../middleware/rateLimiter');

router.get('/register', ctrl.registerPage);
router.post('/register', formLimiter, csrfProtect, ctrl.registerSubmit);

router.post('/check-aadhar', formLimiter, ctrl.checkAadhar);

// Note: /payslip routes are mounted at root in app.js separately

module.exports = router;
