const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/apiController');

router.post('/gtimes/sync', apiLimiter, ctrl.gtimesSync);

module.exports = router;
