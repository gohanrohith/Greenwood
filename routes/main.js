const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mainController');
const { formLimiter } = require('../middleware/rateLimiter');
const { csrfProtect } = require('../middleware/csrf');
const { admissionEnquiry: validateAdmission, contactForm: validateContact, concernForm: validateConcern, handleErrors } = require('../middleware/validators');

router.get('/', ctrl.home);
router.get('/about', ctrl.about);
router.get('/campuses', ctrl.campuses);
router.get('/academics', ctrl.academics);
router.get('/facilities', ctrl.facilities);
router.get('/skill-labs', ctrl.skillLabs);
router.get('/admissions', ctrl.admissions);
router.post('/admissions/enquiry', formLimiter, csrfProtect, ...validateAdmission, handleErrors('/admissions'), ctrl.admissionEnquiry);
router.get('/achievements', ctrl.achievements);
router.get('/news', ctrl.news);
router.get('/gallery', ctrl.gallery);
router.get('/careers', ctrl.careers);
router.get('/contact', ctrl.contact);
router.post('/contact', formLimiter, csrfProtect, ...validateContact, handleErrors('/contact'), ctrl.contactSubmit);
router.get('/concern', ctrl.concern);
router.post('/concern', formLimiter, csrfProtect, ...validateConcern, handleErrors('/concern'), ctrl.concernSubmit);
router.get('/compliance', ctrl.compliance);
router.get('/search', ctrl.search);
router.post('/newsletter/subscribe', formLimiter, csrfProtect, ctrl.newsletterSubscribe);
router.get('/newsletter/unsubscribe', ctrl.newsletterUnsubscribe);

// Legal pages
router.get('/privacy-policy', ctrl.legalPage('privacy-policy'));
router.get('/terms', ctrl.legalPage('terms'));
router.get('/child-protection', ctrl.legalPage('child-protection'));
router.get('/anti-bullying', ctrl.legalPage('anti-bullying'));
router.get('/posh', ctrl.legalPage('posh'));
router.get('/refund-policy', ctrl.legalPage('refund'));
router.get('/cookie-policy', ctrl.legalPage('cookie'));
router.get('/media-consent', ctrl.legalPage('media-consent'));

// SEO
router.get('/sitemap.xml', ctrl.sitemap);
router.get('/robots.txt', ctrl.robots);

module.exports = router;
