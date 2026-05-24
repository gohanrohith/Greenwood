const { body, validationResult } = require('express-validator');

const VALID_CAMPUSES = ['hasanparthy', 'hunterroad', 'naimnagar', 'mancherial', 'gopalpur', 'main', ''];

exports.admissionEnquiry = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[+\d\s()\-]{7,20}$/).withMessage('Enter a valid phone number'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('student_name').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('class').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('campus').optional({ checkFalsy: true }).trim().isIn(VALID_CAMPUSES),
  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
];

exports.contactForm = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[+\d\s()\-]{7,20}$/).withMessage('Enter a valid phone number'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
];

exports.handleErrors = (redirectPath) => (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`${redirectPath}?error=${encodeURIComponent(errors.array()[0].msg)}`);
  }
  next();
};
