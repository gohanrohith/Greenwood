const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { csrfProtect } = require('../middleware/csrf');

router.get('/login', ctrl.loginPage);
router.post('/login', csrfProtect, ctrl.loginSubmit);
router.get('/logout', ctrl.logout);

router.use(requireAdmin);

// CSRF protect all authenticated POST routes
router.use((req, res, next) => {
  if (req.method === 'POST') return csrfProtect(req, res, next);
  next();
});

// Dashboard
router.get('/', ctrl.dashboard);

// Notices
router.get('/notices', ctrl.notices);
router.post('/notices/create', ctrl.createNotice);
router.post('/notices/:id/delete', ctrl.deleteNotice);

// Events
router.get('/events', ctrl.events);
router.post('/events/create', ctrl.createEvent);
router.post('/events/:id/delete', ctrl.deleteEvent);

// Gallery
router.get('/gallery', ctrl.gallery);
router.post('/gallery/upload', ctrl.uploadGallery);
router.post('/gallery/:id/delete', ctrl.deleteGallery);

// Admissions
router.get('/admissions', ctrl.admissions);
router.get('/admissions/:id', ctrl.admissionDetail);
router.post('/admissions/:id/status', ctrl.updateAdmissionStatus);

// Faculty
router.get('/faculty', ctrl.facultyList);
router.post('/faculty/create', ctrl.createFaculty);
router.post('/faculty/:id/delete', ctrl.deleteFaculty);

// Compliance Documents
router.get('/compliance', ctrl.complianceList);
router.post('/compliance/upload', ctrl.uploadComplianceDoc);
router.post('/compliance/:id/delete', ctrl.deleteComplianceDoc);

// Downloads
router.get('/downloads', ctrl.downloadsList);
router.post('/downloads/upload', ctrl.uploadDownload);
router.post('/downloads/:id/delete', ctrl.deleteDownload);

// Testimonials
router.get('/testimonials',                ctrl.testimonialsList);
router.post('/testimonials/create',        ctrl.createTestimonial);
router.post('/testimonials/google-sync',   ctrl.syncGoogleReviews);
router.post('/testimonials/:id/delete',    ctrl.deleteTestimonial);

// Newsletter
router.get('/newsletter',              ctrl.newsletterList);
router.post('/newsletter/:id/delete',  ctrl.deleteNewsletterSub);

// Concerns
router.get('/concerns', ctrl.concernsList);
router.post('/concerns/:id/status', ctrl.updateConcernStatus);

// Session keepalive (auto-logout heartbeat)
router.get('/keepalive', (req, res) => { req.session.touch(); res.sendStatus(204); });

// Settings
router.get('/settings', ctrl.settings);
router.post('/settings', ctrl.saveSettings);

module.exports = router;
