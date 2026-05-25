const bcrypt = require('bcrypt');
const path  = require('path');
const fs    = require('fs');
const { syncGoogleReviews } = require('../services/googleReviews');
const multer = require('multer');
const { isValidImage, isValidDocument } = require('../utils/magicBytes');

// ── Multer factories ──────────────────────────────────
function imageUpload(dest, maxCount = 10) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads', dest)),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = /jpeg|jpg|png|gif|webp/.test(file.mimetype);
      cb(ok ? null : new Error('Images only'), ok);
    },
  }).array('images', maxCount);
}

function fileUpload(dest) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads', dest)),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }).single('file');
}

const galleryUpload   = imageUpload('gallery');
const facultyUpload   = imageUpload('faculty', 1);
const documentUpload  = fileUpload('documents');
const downloadUpload  = fileUpload('downloads');

// ── DB helpers ────────────────────────────────────────
async function q(sql, params = []) {
  try {
    const { query } = require('../config/db');
    return await query(sql, params);
  } catch (e) { console.error(e.message); return []; }
}
async function q1(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] || null;
}

// ── Auth ──────────────────────────────────────────────
exports.loginPage = (req, res) => {
  if (req.session.adminId !== undefined) return res.redirect('/admin');
  res.render('admin/login', { title: 'Admin Login | Greenwood', error: null });
};

exports.loginSubmit = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { queryOne } = require('../config/db');
    const admin = await queryOne('SELECT * FROM admins WHERE username = ?', [username]);
    if (admin && await bcrypt.compare(password, admin.password)) {
      req.session.adminId   = admin.id;
      req.session.adminName = admin.name;
      req.session.adminRole = admin.role;
      req.session.adminCampus = admin.campus;
      return res.redirect('/admin');
    }
  } catch { /* DB not ready — deny */ }
  res.render('admin/login', { title: 'Admin Login | Greenwood', error: 'Invalid credentials' });
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};

// ── Dashboard ─────────────────────────────────────────
exports.dashboard = async (req, res) => {
  const [e, n, g, f, ev] = await Promise.all([
    q1('SELECT COUNT(*) as c FROM admission_enquiries WHERE status="new"'),
    q1('SELECT COUNT(*) as c FROM notices WHERE is_active=1'),
    q1('SELECT COUNT(*) as c FROM gallery WHERE is_active=1'),
    q1('SELECT COUNT(*) as c FROM faculty WHERE is_active=1'),
    q1('SELECT COUNT(*) as c FROM events WHERE is_active=1'),
  ]);
  const recentEnquiries = await q('SELECT * FROM admission_enquiries ORDER BY created_at DESC LIMIT 5');
  res.render('admin/dashboard', {
    title: 'Dashboard | Greenwood Admin',
    adminName: req.session.adminName,
    stats: {
      enquiries: e?.c || 0,
      notices:   n?.c || 0,
      gallery:   g?.c || 0,
      faculty:   f?.c || 0,
      events:    ev?.c || 0,
    },
    recentEnquiries,
  });
};

// ── Notices ───────────────────────────────────────────
exports.notices = async (req, res) => {
  const notices = await q('SELECT * FROM notices ORDER BY created_at DESC');
  res.render('admin/notices', { title: 'Notices | Greenwood Admin', notices });
};
exports.createNotice = async (req, res) => {
  const { title, content, campus, category } = req.body;
  await q('INSERT INTO notices (title, content, campus, category, created_by) VALUES (?,?,?,?,?)',
    [title, content, campus || 'all', category || 'general', req.session.adminId || null]);
  res.redirect('/admin/notices');
};
exports.deleteNotice = async (req, res) => {
  await q('UPDATE notices SET is_active=0 WHERE id=?', [req.params.id]);
  res.redirect('/admin/notices');
};

// ── Events ────────────────────────────────────────────
exports.events = async (req, res) => {
  const events = await q('SELECT * FROM events WHERE source="local" ORDER BY created_at DESC');
  res.render('admin/events', { title: 'Events | Greenwood Admin', events });
};
exports.createEvent = async (req, res) => {
  const { title, description, campus, event_date, category } = req.body;
  await q('INSERT INTO events (title, description, campus, event_date, category, created_by) VALUES (?,?,?,?,?,?)',
    [title, description || null, campus || 'all', event_date || null, category || 'general', req.session.adminId || null]);
  res.redirect('/admin/events');
};
exports.deleteEvent = async (req, res) => {
  await q('UPDATE events SET is_active=0 WHERE id=?', [req.params.id]);
  res.redirect('/admin/events');
};

// ── Gallery ───────────────────────────────────────────
exports.gallery = async (req, res) => {
  const gallery = await q('SELECT * FROM gallery WHERE is_active=1 ORDER BY created_at DESC');
  res.render('admin/gallery', { title: 'Gallery | Greenwood Admin', gallery });
};
exports.uploadGallery = (req, res) => {
  galleryUpload(req, res, async err => {
    if (err) return res.redirect('/admin/gallery?error=' + encodeURIComponent(err.message));
    const { caption, campus, category } = req.body;
    let uploaded = 0;
    for (const file of (req.files || [])) {
      const filePath = path.join(__dirname, '../public/uploads/gallery', file.filename);
      if (!isValidImage(filePath)) { fs.unlinkSync(filePath); continue; }
      await q('INSERT INTO gallery (filename, caption, campus, category, uploaded_by) VALUES (?,?,?,?,?)',
        [file.filename, caption || null, campus || 'main', category || 'general', req.session.adminId || null]);
      uploaded++;
    }
    if (uploaded === 0 && (req.files || []).length > 0) {
      return res.redirect('/admin/gallery?error=No+valid+images.+Files+must+be+real+JPG%2FPNG%2FGIF%2FWebP.');
    }
    res.redirect('/admin/gallery');
  });
};
exports.deleteGallery = async (req, res) => {
  await q('UPDATE gallery SET is_active=0 WHERE id=?', [req.params.id]);
  res.redirect('/admin/gallery');
};

// ── Admissions ────────────────────────────────────────
exports.admissions = async (req, res) => {
  const { status, campus } = req.query;
  let sql = 'SELECT * FROM admission_enquiries WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND status=?'; params.push(status); }
  if (campus) { sql += ' AND campus=?'; params.push(campus); }
  sql += ' ORDER BY created_at DESC';
  const enquiries = await q(sql, params);
  res.render('admin/admissions', { title: 'Admissions | Greenwood Admin', enquiries, filters: { status, campus } });
};
exports.admissionDetail = async (req, res) => {
  const admission = await q1('SELECT * FROM admission_enquiries WHERE id=?', [req.params.id]);
  res.render('admin/admission-detail', { title: 'Admission Detail | Greenwood Admin', admission });
};
exports.updateAdmissionStatus = async (req, res) => {
  await q('UPDATE admission_enquiries SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.redirect(`/admin/admissions/${req.params.id}`);
};

// ── Faculty ───────────────────────────────────────────
exports.facultyList = async (req, res) => {
  const campus = req.query.campus || '';
  let sql = 'SELECT * FROM faculty WHERE 1=1';
  const params = [];
  if (campus) { sql += ' AND campus=?'; params.push(campus); }
  sql += ' ORDER BY campus, sort_order, name';
  const faculty = await q(sql, params);
  res.render('admin/faculty', { title: 'Faculty | Greenwood Admin', faculty, filterCampus: campus });
};
exports.createFaculty = (req, res) => {
  facultyUpload(req, res, async err => {
    if (err) return res.redirect('/admin/faculty?error=' + encodeURIComponent(err.message));
    const { campus, name, designation, subject, qualification, experience, sort_order } = req.body;
    let photo = req.files?.[0]?.filename || null;
    if (photo) {
      const filePath = path.join(__dirname, '../public/uploads/faculty', photo);
      if (!isValidImage(filePath)) {
        fs.unlinkSync(filePath);
        return res.redirect('/admin/faculty?error=Invalid+image+file+type');
      }
    }
    await q('INSERT INTO faculty (campus, name, designation, subject, qualification, experience, photo, sort_order) VALUES (?,?,?,?,?,?,?,?)',
      [campus, name, designation, subject || null, qualification || null, experience || null, photo, sort_order || 0]);
    res.redirect('/admin/faculty');
  });
};
exports.deleteFaculty = async (req, res) => {
  await q('UPDATE faculty SET is_active=0 WHERE id=?', [req.params.id]);
  res.redirect('/admin/faculty');
};

// ── Compliance Documents ──────────────────────────────
exports.complianceList = async (req, res) => {
  const campus = req.query.campus || '';
  let sql = 'SELECT * FROM compliance_documents WHERE 1=1';
  const params = [];
  if (campus) { sql += ' AND campus=?'; params.push(campus); }
  sql += ' ORDER BY campus, sort_order';
  const docs = await q(sql, params);
  res.render('admin/compliance', { title: 'Compliance Docs | Greenwood Admin', docs, filterCampus: campus });
};
exports.uploadComplianceDoc = (req, res) => {
  documentUpload(req, res, async err => {
    if (err) return res.redirect('/admin/compliance?error=' + encodeURIComponent(err.message));
    const { campus, doc_type, label, year, sort_order } = req.body;
    if (!req.file) return res.redirect('/admin/compliance?error=No+file+uploaded');
    const filePath = path.join(__dirname, '../public/uploads/documents', req.file.filename);
    if (!isValidDocument(filePath)) {
      fs.unlinkSync(filePath);
      return res.redirect('/admin/compliance?error=Invalid+file+type.+Only+PDF%2C+DOC%2C+DOCX%2C+XLS%2C+XLSX+allowed.');
    }
    await q('INSERT INTO compliance_documents (campus, doc_type, label, filename, year, sort_order, uploaded_by) VALUES (?,?,?,?,?,?,?)',
      [campus, doc_type, label, req.file.filename, year || null, sort_order || 0, req.session.adminId || null]);
    res.redirect('/admin/compliance');
  });
};
exports.deleteComplianceDoc = async (req, res) => {
  await q('UPDATE compliance_documents SET is_active=0 WHERE id=?', [req.params.id]);
  res.redirect('/admin/compliance');
};

// ── Downloads ─────────────────────────────────────────
exports.downloadsList = async (req, res) => {
  const downloads = await q('SELECT * FROM downloads WHERE is_active=1 ORDER BY campus, category, created_at DESC');
  res.render('admin/downloads', { title: 'Downloads | Greenwood Admin', downloads });
};
exports.uploadDownload = (req, res) => {
  downloadUpload(req, res, async err => {
    if (err) return res.redirect('/admin/downloads?error=' + encodeURIComponent(err.message));
    const { campus, label, category } = req.body;
    if (!req.file) return res.redirect('/admin/downloads?error=No+file+uploaded');
    const filePath = path.join(__dirname, '../public/uploads/downloads', req.file.filename);
    if (!isValidDocument(filePath)) {
      fs.unlinkSync(filePath);
      return res.redirect('/admin/downloads?error=Invalid+file+type.+Only+PDF%2C+DOC%2C+DOCX%2C+XLS%2C+XLSX+allowed.');
    }
    await q('INSERT INTO downloads (campus, label, filename, category, uploaded_by) VALUES (?,?,?,?,?)',
      [campus || 'all', label, req.file.filename, category || 'other', req.session.adminId || null]);
    res.redirect('/admin/downloads');
  });
};
exports.deleteDownload = async (req, res) => {
  await q('UPDATE downloads SET is_active=0 WHERE id=?', [req.params.id]);
  res.redirect('/admin/downloads');
};

// ── Settings ──────────────────────────────────────────
exports.settings = async (req, res) => {
  const rows = await q('SELECT setting_key, value FROM settings');
  const map = {};
  rows.forEach(s => { map[s.setting_key] = s.value; });
  res.render('admin/settings', {
    title: 'Settings | Greenwood Admin',
    settings: map,
    success: req.query.success || null,
    error: req.query.error || null,
  });
};
exports.saveSettings = async (req, res) => {
  const { admissions_open, admission_year, phone_main, whatsapp_main,
          google_place_id, google_places_api_key,
          current_password, new_password, confirm_password } = req.body;

  if (admissions_open !== undefined) {
    await q('INSERT INTO settings (setting_key, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
      ['admissions_open', admissions_open, admissions_open]);
  }
  if (admission_year) {
    await q('INSERT INTO settings (setting_key, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
      ['admission_year', admission_year, admission_year]);
  }
  if (phone_main) {
    await q('INSERT INTO settings (setting_key, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
      ['phone_main', phone_main, phone_main]);
  }
  if (whatsapp_main) {
    await q('INSERT INTO settings (setting_key, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
      ['whatsapp_main', whatsapp_main, whatsapp_main]);
  }
  if (google_place_id !== undefined) {
    await q('INSERT INTO settings (setting_key, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
      ['google_place_id', google_place_id.trim(), google_place_id.trim()]);
  }
  if (google_places_api_key !== undefined) {
    await q('INSERT INTO settings (setting_key, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
      ['google_places_api_key', google_places_api_key.trim(), google_places_api_key.trim()]);
  }

  if (new_password) {
    if (new_password !== confirm_password) return res.redirect('/admin/settings?error=Passwords+do+not+match');
    try {
      const { queryOne } = require('../config/db');
      const admin = await queryOne('SELECT password FROM admins WHERE id=?', [req.session.adminId]);
      if (!admin || !await bcrypt.compare(current_password, admin.password)) {
        return res.redirect('/admin/settings?error=Wrong+current+password');
      }
      const hash = await bcrypt.hash(new_password, 10);
      await q('UPDATE admins SET password=? WHERE id=?', [hash, req.session.adminId]);
    } catch { /* DB issue */ }
  }

  res.redirect('/admin/settings?success=1');
};

// ── Testimonials ──────────────────────────────────────
exports.testimonialsList = async (req, res) => {
  const [testimonials, settingsRows] = await Promise.all([
    q('SELECT * FROM testimonials WHERE is_active=1 ORDER BY sort_order ASC, created_at DESC'),
    q('SELECT setting_key, value FROM settings WHERE setting_key IN (?,?,?)',
      ['google_place_id','google_places_api_key','google_overall_rating']),
  ]);
  const settingsMap = {};
  settingsRows.forEach(s => { settingsMap[s.setting_key] = s.value; });
  res.render('admin/testimonials', {
    title: 'Testimonials | Greenwood Admin',
    testimonials,
    settings: settingsMap,
    success: req.query.success || null,
    error:   req.query.error   || null,
  });
};

exports.createTestimonial = async (req, res) => {
  const { name, role, campus, quote, rating, sort_order } = req.body;
  if (!name || !quote) return res.redirect('/admin/testimonials?error=Name+and+quote+required');
  await q('INSERT INTO testimonials (name, role, campus, quote, rating, sort_order) VALUES (?,?,?,?,?,?)',
    [name.trim(), role || 'Parent', campus || null, quote.trim(), parseInt(rating) || 5, parseInt(sort_order) || 0]);
  res.redirect('/admin/testimonials?success=1');
};

exports.deleteTestimonial = async (req, res) => {
  await q('UPDATE testimonials SET is_active=0 WHERE id=?', [req.params.id]);
  res.redirect('/admin/testimonials');
};

exports.syncGoogleReviews = async (req, res) => {
  try {
    const settingsRows = await q('SELECT setting_key, value FROM settings WHERE setting_key IN (?,?)',
      ['google_place_id', 'google_places_api_key']);
    const sm = {};
    settingsRows.forEach(s => { sm[s.setting_key] = s.value; });
    if (!sm.google_place_id || !sm.google_places_api_key) {
      return res.redirect('/admin/testimonials?error=Set+Google+Place+ID+and+API+Key+in+Settings+first');
    }
    const result = await syncGoogleReviews(sm.google_place_id, sm.google_places_api_key, q);
    if (result.overallRating) {
      await q('INSERT INTO settings (setting_key,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
        ['google_overall_rating', String(result.overallRating), String(result.overallRating)]);
      await q('INSERT INTO settings (setting_key,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?',
        ['google_total_ratings', String(result.totalRatings), String(result.totalRatings)]);
    }
    res.redirect(`/admin/testimonials?success=Synced+${result.synced}+new+reviews`);
  } catch (err) {
    res.redirect(`/admin/testimonials?error=${encodeURIComponent(err.message)}`);
  }
};

// ── Newsletter admin ──────────────────────────────────
exports.newsletterList = async (req, res) => {
  const subscribers = await q('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
  res.render('admin/newsletter', {
    title: 'Newsletter | Greenwood Admin',
    subscribers,
  });
};

exports.deleteNewsletterSub = async (req, res) => {
  await q('DELETE FROM newsletter_subscribers WHERE id=?', [req.params.id]);
  res.redirect('/admin/newsletter');
};
