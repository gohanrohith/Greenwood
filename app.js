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
const mainRoutes    = require('./routes/main');
const campusRoutes  = require('./routes/campus');
const adminRoutes   = require('./routes/admin');
const apiRoutes     = require('./routes/api');
const teacherRoutes = require('./routes/teachers');
const { payslipPage, payslipValidate } = require('./controllers/teacherController');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadsDir));

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'greenwood-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

if (process.env.DB_PASS) {
  try {
    const pool = require('./config/database');
    const mysqlStore = new MySQLStore({
      clearExpired: true,
      checkExpirationInterval: 900000,
      expiration: 86400000,
      createDatabaseTable: false,
    }, pool);

    // Wrap MySQL store with in-memory fallback so sessions work even when DB is
    // unavailable (wrong password, cold start). MySQL is still attempted for
    // persistence across restarts; memory fills the gap when it fails.
    class SafeStore extends session.Store {
      constructor() { super(); this._mem = {}; }
      get(sid, cb) {
        mysqlStore.get(sid, (e, s) => cb(null, (!e && s) ? s : (this._mem[sid] || null)));
      }
      set(sid, s, cb) {
        this._mem[sid] = s;
        cb(null);
        mysqlStore.set(sid, s, () => {});
      }
      destroy(sid, cb) {
        delete this._mem[sid];
        mysqlStore.destroy(sid, () => cb(null));
      }
    }
    sessionConfig.store = new SafeStore();
  } catch (e) {
    console.warn('Session store init failed, using memory store:', e.message);
  }
}

app.use(session(sessionConfig));
app.use(csrfMiddleware);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(campusMiddleware);

const CAMPUS_SLUGS = ['hasanparthy', 'hunterroad', 'naimnagar', 'mancherial', 'gopalpur'];

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/teachers', teacherRoutes);
app.get('/payslip', payslipPage);
app.post('/payslip/validate', require('./middleware/rateLimiter').formLimiter, require('./middleware/csrf').csrfProtect, payslipValidate);
CAMPUS_SLUGS.forEach(slug => app.use(`/${slug}`, campusRoutes));
app.use('/', mainRoutes);

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
  console.log(`  Hasanparthy →  http://lvh.me:${PORT}/hasanparthy`);
  console.log(`  Hunter Road →  http://lvh.me:${PORT}/hunterroad`);
  console.log(`  Naimnagar   →  http://lvh.me:${PORT}/naimnagar`);
  console.log(`  Mancherial  →  http://lvh.me:${PORT}/mancherial`);
  console.log(`  Gopalpur    →  http://lvh.me:${PORT}/gopalpur`);
  console.log(`  Admin       →  http://lvh.me:${PORT}/admin\n`);
});
