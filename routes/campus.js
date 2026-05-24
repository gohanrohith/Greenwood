const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campusController');
const { formLimiter } = require('../middleware/rateLimiter');
const { csrfProtect } = require('../middleware/csrf');
const { admissionEnquiry: validateAdmission, contactForm: validateContact, handleErrors } = require('../middleware/validators');

router.get('/', ctrl.home);
router.get('/about', ctrl.about);
router.get('/academics', ctrl.academics);
router.get('/faculty', ctrl.faculty);
router.get('/facilities', ctrl.facilities);
router.get('/gallery', ctrl.gallery);
router.get('/events', ctrl.events);
router.get('/admissions', ctrl.admissions);
router.post('/admissions/enquiry', formLimiter, csrfProtect, ...validateAdmission, handleErrors('/admissions'), ctrl.admissionEnquiry);
router.get('/notices', ctrl.notices);
router.get('/contact', ctrl.contact);
router.post('/contact', formLimiter, csrfProtect, ...validateContact, handleErrors('/contact'), ctrl.contactSubmit);
router.get('/disclosure', ctrl.disclosure);
router.get('/downloads', ctrl.downloads);

module.exports = router;
