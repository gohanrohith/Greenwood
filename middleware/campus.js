const { getCampus } = require('../config/campuses');
const school = require('../config/school');

const CAMPUS_SLUGS = ['hasanparthy', 'hunterroad', 'naimnagar', 'mancherial', 'gopalpur'];

module.exports = function campusMiddleware(req, res, next) {
  const segments = req.path.split('/').filter(Boolean);
  const first = segments[0] || '';

  if (first === 'admin') {
    req.site = 'admin';
    req.campus = null;
    req.campusBase = '/admin';
  } else if (CAMPUS_SLUGS.includes(first)) {
    const campus = getCampus(first);
    if (campus) {
      req.site = 'campus';
      req.campus = campus;
      req.campusBase = `/${first}`;
    } else {
      req.site = 'main';
      req.campus = null;
      req.campusBase = '';
    }
  } else {
    req.site = 'main';
    req.campus = null;
    req.campusBase = '';
  }

  const canonicalDomain = process.env.MAIN_DOMAIN || 'ghs.ac.in';
  if (req.site === 'campus' && req.campus) {
    const subPath = req.path.slice(req.campusBase.length) || '/';
    res.locals.canonicalUrl = `https://${canonicalDomain}/${req.campus.slug}${subPath}`;
  } else if (req.site === 'main') {
    res.locals.canonicalUrl = `https://${canonicalDomain}${req.path}`;
  } else {
    res.locals.canonicalUrl = null;
  }

  res.locals.site        = req.site;
  res.locals.campus      = req.campus;
  res.locals.school      = school;
  res.locals.campusBase  = req.campusBase || '';
  res.locals.currentYear = new Date().getFullYear();

  next();
};
