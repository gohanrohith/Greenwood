const school = require('../config/school');

async function dbQuery(sql, params = []) {
  try {
    const { query } = require('../config/db');
    return await query(sql, params);
  } catch { return []; }
}

async function getNotices(campus) {
  return dbQuery(
    `SELECT * FROM notices WHERE is_active=1 AND (campus=? OR campus='all') ORDER BY created_at DESC LIMIT 10`,
    [campus]
  );
}

async function getGallery(campus, limit = 12) {
  return dbQuery(
    `SELECT * FROM gallery WHERE is_active=1 AND campus=? ORDER BY created_at DESC LIMIT ?`,
    [campus, limit]
  );
}

async function getEvents(campus) {
  return dbQuery(
    `SELECT * FROM events WHERE is_active=1 AND (campus=? OR campus='all') ORDER BY COALESCE(event_date, created_at) DESC LIMIT 20`,
    [campus]
  );
}

async function getFaculty(campus) {
  return dbQuery(
    `SELECT * FROM faculty WHERE is_active=1 AND campus=? ORDER BY sort_order ASC, name ASC`,
    [campus]
  );
}

async function getDownloads(campus) {
  return dbQuery(
    `SELECT * FROM downloads WHERE is_active=1 AND (campus=? OR campus='all') ORDER BY category ASC, created_at DESC`,
    [campus]
  );
}

async function getComplianceDocs(campus) {
  return dbQuery(
    `SELECT * FROM compliance_documents WHERE is_active=1 AND campus=? ORDER BY sort_order ASC, doc_type ASC`,
    [campus]
  );
}

const base = (req) => ({ school });

exports.home = async (req, res) => {
  const c = req.campus;
  const [notices, gallery] = await Promise.all([getNotices(c.slug), getGallery(c.slug, 6)]);
  res.render('campus/index', {
    title: `${c.name} | Greenwood High School`,
    notices,
    gallery,
    ...base(req),
  });
};

exports.about = (req, res) => {
  res.render('campus/about', {
    title: `About | ${req.campus.name}`,
    ...base(req),
  });
};

exports.academics = (req, res) => {
  res.render('campus/academics', {
    title: `Academics | ${req.campus.name}`,
    ...base(req),
  });
};

exports.faculty = async (req, res) => {
  const faculty = await getFaculty(req.campus.slug);
  res.render('campus/faculty', {
    title: `Faculty | ${req.campus.name}`,
    faculty,
    ...base(req),
  });
};

exports.facilities = (req, res) => {
  res.render('campus/facilities', {
    title: `Facilities | ${req.campus.name}`,
    ...base(req),
  });
};

exports.gallery = async (req, res) => {
  const gallery = await getGallery(req.campus.slug, 48);
  res.render('campus/gallery', {
    title: `Gallery | ${req.campus.name}`,
    gallery,
    ...base(req),
  });
};

exports.events = async (req, res) => {
  const events = await getEvents(req.campus.slug);
  res.render('campus/events', {
    title: `Events | ${req.campus.name}`,
    events,
    ...base(req),
  });
};

exports.admissions = async (req, res) => {
  const { notifyAdmissionEnquiry } = require('../config/mailer');
  res.render('campus/admissions', {
    title: `Admissions | ${req.campus.name}`,
    success: req.query.success || null,
    ...base(req),
  });
};

exports.admissionEnquiry = async (req, res) => {
  const { name, phone, email, student_name, class: cls, message } = req.body;
  if (!name || !phone) return res.redirect('/admissions?error=Fill+required+fields');
  try {
    const { query } = require('../config/db');
    await query(
      `INSERT INTO admission_enquiries (parent_name, phone, email, student_name, class_seeking, campus, message) VALUES (?,?,?,?,?,?,?)`,
      [name, phone, email || null, student_name || null, cls || null, req.campus.slug, message || null]
    );
    const { notifyAdmissionEnquiry } = require('../config/mailer');
    notifyAdmissionEnquiry({ parent_name: name, phone, email, student_name, class_seeking: cls, campus: req.campus.name, message }).catch(() => {});
  } catch (e) { console.error('Admission save error:', e.message); }
  res.redirect('/admissions?success=1');
};

exports.notices = async (req, res) => {
  const notices = await getNotices(req.campus.slug);
  res.render('campus/notices', {
    title: `Notices | ${req.campus.name}`,
    notices,
    ...base(req),
  });
};

exports.contact = (req, res) => {
  res.render('campus/contact', {
    title: `Contact | ${req.campus.name}`,
    success: req.query.success || null,
    ...base(req),
  });
};

exports.contactSubmit = async (req, res) => {
  const { name, phone, email, message } = req.body;
  try {
    const { query } = require('../config/db');
    await query(
      `INSERT INTO contact_submissions (name, phone, email, subject, message) VALUES (?,?,?,?,?)`,
      [name, phone, email || null, `Campus enquiry: ${req.campus.name}`, message]
    );
  } catch (e) { console.error('Contact save error:', e.message); }
  res.redirect('/contact?success=1');
};

exports.disclosure = async (req, res) => {
  const docs = await getComplianceDocs(req.campus.slug);
  const grouped = {};
  docs.forEach(d => {
    if (!grouped[d.doc_type]) grouped[d.doc_type] = [];
    grouped[d.doc_type].push(d);
  });
  res.render('campus/disclosure', {
    title: `Mandatory Public Disclosure | ${req.campus.name}`,
    docs: grouped,
    ...base(req),
  });
};

exports.downloads = async (req, res) => {
  const downloads = await getDownloads(req.campus.slug);
  const grouped = {};
  downloads.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });
  res.render('campus/downloads', {
    title: `Downloads | ${req.campus.name}`,
    downloads: grouped,
    ...base(req),
  });
};
