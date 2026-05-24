require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const campusMiddleware = require('./middleware/campus');
const { csrfMiddleware } = require('./middleware/csrf');
const mainRoutes  = require('./routes/main');
const campusRoutes = require('./routes/campus');
const adminRoutes  = require('./routes/admin');
const apiRoutes    = require('./routes/api');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'greenwood-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

if (process.env.DB_PASS) {
  try {
    const pool = require('./config/database');
    sessionConfig.store = new MySQLStore({
      clearExpired: true,
      checkExpirationInterval: 900000,
      expiration: 86400000,
    }, pool);
  } catch (e) {
    console.warn('Session store fallback to memory (DB not ready)');
  }
}

app.use(session(sessionConfig));
app.use(csrfMiddleware);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(campusMiddleware);

// API routes (no campus detection needed)
app.use('/api', apiRoutes);

// Site router
app.use((req, res, next) => {
  if (req.site === 'admin')  return adminRoutes(req, res, next);
  if (req.site === 'main')   return mainRoutes(req, res, next);
  return campusRoutes(req, res, next);
});

app.use((req, res) => {
  res.status(404).render('404', { site: req.site || 'main', campus: req.campus || null });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { site: req.site || 'main', campus: req.campus || null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Greenwood running at:`);
  console.log(`  Main site   →  http://lvh.me:${PORT}`);
  console.log(`  Hasanparthy →  http://hasanparthy.lvh.me:${PORT}`);
  console.log(`  Hunter Road →  http://hunterroad.lvh.me:${PORT}`);
  console.log(`  Naimnagar   →  http://naimnagar.lvh.me:${PORT}`);
  console.log(`  Mancherial  →  http://mancherial.lvh.me:${PORT}`);
  console.log(`  Gopalpur    →  http://gopalpur.lvh.me:${PORT}`);
  console.log(`  Admin       →  http://admin.lvh.me:${PORT}\n`);
});
