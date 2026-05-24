const { getCampus } = require('../config/campuses');
const school = require('../config/school');

const CAMPUS_SLUGS = ['hasanparthy', 'hunterroad', 'naimnagar', 'mancherial', 'gopalpur'];

module.exports = function campusMiddleware(req, res, next) {
  const mainDomain = process.env.MAIN_DOMAIN || 'lvh.me';
  const hostname = req.hostname; // e.g. hasanparthy.lvh.me or hasanparthy.ghs.ac.in

  // Strip the main domain to get the subdomain part
  let subdomain = '';
  if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
    subdomain = '';
  } else if (hostname.endsWith(`.${mainDomain}`)) {
    subdomain = hostname.slice(0, hostname.length - mainDomain.length - 1);
  }

  // Determine which site is being requested
  if (subdomain === 'admin') {
    req.site = 'admin';
    req.campus = null;
  } else if (CAMPUS_SLUGS.includes(subdomain)) {
    req.site = 'campus';
    req.campus = getCampus(subdomain);
    if (!req.campus) {
      req.site = 'main';
      req.campus = null;
    }
  } else {
    req.site = 'main';
    req.campus = null;
  }

  // Canonical URL — always use production domain for SEO correctness
  const canonicalDomain = process.env.MAIN_DOMAIN || 'ghs.ac.in';
  if (req.site === 'campus' && req.campus) {
    res.locals.canonicalUrl = `https://${req.campus.slug}.${canonicalDomain}${req.path}`;
  } else if (req.site === 'main') {
    res.locals.canonicalUrl = `https://${canonicalDomain}${req.path}`;
  } else {
    res.locals.canonicalUrl = null;
  }

  // Make campus/site available in all EJS templates
  res.locals.site    = req.site;
  res.locals.campus  = req.campus;
  res.locals.school  = school;
  res.locals.currentYear = new Date().getFullYear();

  next();
};
