const { getAllCampuses } = require('../config/campuses');
const crypto = require('crypto');
const { notifyAdmissionEnquiry, notifyContactSubmission, autoReplyAdmissionEnquiry } = require('../config/mailer');

async function dbQuery(sql, params = []) {
  try {
    const { query } = require('../config/db');
    return await query(sql, params);
  } catch { return []; }
}

async function dbQueryOne(sql, params = []) {
  const rows = await dbQuery(sql, params);
  return rows[0] || null;
}

async function getNotices(campus = 'all') {
  return dbQuery(
    `SELECT * FROM notices WHERE is_active=1 AND (campus=? OR campus='all') ORDER BY created_at DESC LIMIT 5`,
    [campus]
  );
}

async function getGallery(campus = 'main', limit = 8) {
  return dbQuery(
    `SELECT * FROM gallery WHERE is_active=1 AND campus=? ORDER BY created_at DESC LIMIT ?`,
    [campus, limit]
  );
}

async function getEvents(limit = 10) {
  return dbQuery(
    `SELECT * FROM events WHERE is_active=1 ORDER BY COALESCE(event_date, created_at) DESC LIMIT ?`,
    [limit]
  );
}

async function getArticles(limit = 10) {
  return dbQuery(
    `SELECT * FROM articles WHERE is_active=1 ORDER BY published_at DESC LIMIT ?`,
    [limit]
  );
}

async function getTestimonials(limit = 3) {
  return dbQuery('SELECT * FROM testimonials WHERE is_active=1 ORDER BY sort_order ASC, created_at DESC LIMIT ?', [limit]);
}

exports.home = async (req, res) => {
  const [notices, gallery, testimonials] = await Promise.all([getNotices(), getGallery(), getTestimonials()]);
  res.render('main/index', {
    title: 'Greenwood High School Warangal | Official Website',
    campuses: getAllCampuses(),
    notices,
    gallery,
    testimonials,
  });
};

exports.about = (req, res) => {
  const school = require('../config/school');
  res.render('main/about', {
    title: 'About Us | Greenwood High School',
    school,
    campuses: getAllCampuses(),
  });
};

exports.campuses = (req, res) => {
  res.render('main/campuses', {
    title: 'Our Campuses | Greenwood High School',
    campuses: getAllCampuses(),
  });
};

exports.academics = (req, res) => {
  res.render('main/academics', { title: 'Academics | Greenwood High School' });
};

exports.facilities = (req, res) => {
  res.render('main/facilities', { title: 'Facilities | Greenwood High School' });
};

exports.admissions = async (req, res) => {
  const settings = await dbQuery('SELECT setting_key, value FROM settings WHERE setting_key IN (?,?)', ['admissions_open','admission_year']);
  const settingsMap = {};
  settings.forEach(s => { settingsMap[s.setting_key] = s.value; });
  res.render('main/admissions', {
    title: 'Admissions | Greenwood High School',
    campuses: getAllCampuses(),
    admissionsOpen: settingsMap.admissions_open !== '0',
    admissionYear: settingsMap.admission_year || '2026-27',
    success: req.query.success || null,
    error: req.query.error || null,
  });
};

exports.admissionEnquiry = async (req, res) => {
  const { name, phone, email, student_name, class: cls, campus, message } = req.body;
  if (!name || !phone) return res.redirect('/admissions?error=Fill+required+fields');
  try {
    const { query } = require('../config/db');
    await query(
      `INSERT INTO admission_enquiries (parent_name, phone, email, student_name, class_seeking, campus, message) VALUES (?,?,?,?,?,?,?)`,
      [name, phone, email || null, student_name || null, cls || null, campus || 'main', message || null]
    );
    notifyAdmissionEnquiry({ parent_name: name, phone, email, student_name, class_seeking: cls, campus, message }).catch(() => {});
    autoReplyAdmissionEnquiry({ parent_name: name, phone, email, student_name, class_seeking: cls, campus }).catch(() => {});
  } catch (e) { console.error('Admission save error:', e.message); }
  res.redirect('/admissions?success=1');
};

exports.achievements = (req, res) => {
  res.render('main/achievements', { title: 'Achievements | Greenwood High School' });
};

exports.news = async (req, res) => {
  const [events, articles, notices] = await Promise.all([getEvents(20), getArticles(20), getNotices()]);
  res.render('main/news', {
    title: 'News & Events | Greenwood High School',
    events,
    articles,
    notices,
  });
};

exports.gallery = async (req, res) => {
  const gallery = await getGallery('main', 48);
  res.render('main/gallery', { title: 'Gallery | Greenwood High School', gallery });
};

exports.careers = (req, res) => {
  res.render('main/careers', { title: 'Careers | Greenwood High School' });
};

exports.contact = (req, res) => {
  res.render('main/contact', {
    title: 'Contact Us | Greenwood High School',
    campuses: getAllCampuses(),
    success: req.query.success || null,
  });
};

exports.contactSubmit = async (req, res) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !message) return res.redirect('/contact?error=1');
  try {
    const { query } = require('../config/db');
    await query(
      `INSERT INTO contact_submissions (name, phone, email, subject, message) VALUES (?,?,?,?,?)`,
      [name, phone, email || null, subject || null, message]
    );
    notifyContactSubmission({ name, phone, email, subject, message }).catch(() => {});
  } catch (e) { console.error('Contact save error:', e.message); }
  res.redirect('/contact?success=1');
};

exports.compliance = (req, res) => {
  res.render('main/compliance', { title: 'Transparency & Compliance | Greenwood High School' });
};

exports.legalPage = (page) => (req, res) => {
  const titles = {
    'privacy-policy': 'Privacy Policy',
    'terms': 'Terms & Conditions',
    'child-protection': 'Child Protection Policy',
    'anti-bullying': 'Anti-Bullying Policy',
    'posh': 'POSH Policy',
    'refund': 'Refund Policy',
    'cookie': 'Cookie Policy',
    'media-consent': 'Media Consent Policy',
  };
  res.render(`main/legal/${page}`, {
    title: `${titles[page] || page} | Greenwood High School`,
  });
};

exports.search = async (req, res) => {
  const q = (req.query.q || '').trim();
  let results = { notices: [], events: [], articles: [] };
  if (q.length >= 2) {
    const like = `%${q}%`;
    const [notices, events, articles] = await Promise.all([
      dbQuery(`SELECT *, 'notice' AS type FROM notices WHERE is_active=1 AND (title LIKE ? OR content LIKE ?) ORDER BY created_at DESC LIMIT 10`, [like, like]),
      dbQuery(`SELECT *, 'event' AS type FROM events WHERE is_active=1 AND (title LIKE ? OR description LIKE ?) ORDER BY created_at DESC LIMIT 10`, [like, like]),
      dbQuery(`SELECT *, 'article' AS type FROM articles WHERE is_active=1 AND (title LIKE ? OR excerpt LIKE ?) ORDER BY published_at DESC LIMIT 10`, [like, like]),
    ]);
    results = { notices, events, articles };
  }
  const total = results.notices.length + results.events.length + results.articles.length;
  res.render('main/search', {
    title: q ? `Search: ${q} | Greenwood High School` : 'Search | Greenwood High School',
    q, results, total,
  });
};

exports.newsletterSubscribe = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.redirect('back');
  }
  try {
    const { query } = require('../config/db');
    const token = crypto.randomBytes(32).toString('hex');
    await query(
      'INSERT INTO newsletter_subscribers (email, name, token) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      [email.trim().toLowerCase(), (name || '').trim() || null, token]);
  } catch { /* duplicate or DB not ready */ }
  res.redirect('/?newsletter=success');
};

exports.newsletterUnsubscribe = async (req, res) => {
  const { token } = req.query;
  if (token) {
    try {
      const { query } = require('../config/db');
      await query('DELETE FROM newsletter_subscribers WHERE token=?', [token]);
    } catch { /* ignore */ }
  }
  res.render('main/unsubscribe', {
    title: 'Unsubscribed | Greenwood High School',
    done: !!token,
  });
};

exports.sitemap = async (req, res) => {
  const campuses = getAllCampuses();
  const base = 'https://ghs.ac.in';
  const mainPages = ['','/about','/campuses','/academics','/facilities','/admissions','/achievements','/news','/gallery','/contact','/compliance'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  mainPages.forEach(p => {
    xml += `  <url><loc>${base}${p}</loc><changefreq>weekly</changefreq></url>\n`;
  });
  campuses.forEach(c => {
    const cBase = `https://${c.slug}.ghs.ac.in`;
    ['/about','/academics','/faculty','/facilities','/events','/gallery','/notices','/downloads','/admissions','/contact'].forEach(p => {
      xml += `  <url><loc>${cBase}${p}</loc><changefreq>weekly</changefreq></url>\n`;
    });
    if (c.cbse) xml += `  <url><loc>${cBase}/disclosure</loc><changefreq>monthly</changefreq></url>\n`;
  });
  xml += `</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
};

exports.robots = (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://ghs.ac.in/sitemap.xml\n`);
};
