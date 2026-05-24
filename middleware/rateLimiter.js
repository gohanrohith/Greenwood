const rateLimit = require('express-rate-limit');

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many submissions. Please try again after 15 minutes.',
  skip: () => process.env.NODE_ENV === 'development',
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
});

module.exports = { formLimiter, apiLimiter };
