'use strict';
const path = require('path');
const multer = require('multer');
const { isValidImage } = require('../utils/magicBytes');

const UPLOADS_BASE = process.env.UPLOADS_DIR || path.join(__dirname, '../public/uploads');

// ── Multer for teacher profile pic ───────────────────────────────────────────
const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOADS_BASE, 'teachers');
      require('fs').mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(file.mimetype);
    cb(ok ? null : new Error('Images only'), ok);
  },
}).single('profile_pic');

// ── DB helpers ────────────────────────────────────────────────────────────────
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

// ── Payroll calculation (pure) ────────────────────────────────────────────────
function calcPayroll(teacher, entry) {
  const gross_salary = parseFloat(teacher.salary_basic) + parseFloat(teacher.salary_hra) +
                       parseFloat(teacher.salary_da) + parseFloat(teacher.salary_transport);
  const days_in  = entry.days_in_month || 26;
  const days_prs = entry.days_present  || 0;
  const per_day  = gross_salary / days_in;
  const earned   = (per_day * days_prs) + parseFloat(entry.bonus || 0);
  const pf       = (parseFloat(teacher.salary_basic) / days_in * days_prs) * (parseFloat(teacher.pf_percent) / 100);
  const esi      = earned <= 21000 ? earned * (parseFloat(teacher.esi_percent) / 100) : 0;
  const tds      = parseFloat(teacher.tds_flat || 0);
  const advance  = parseFloat(entry.advance_deduction || 0);
  const other    = parseFloat(entry.other_deduction_amount || 0);
  const total_deductions = pf + esi + tds + advance + other;
  const net_pay  = earned - total_deductions;
  return {
    gross_salary: gross_salary.toFixed(2),
    per_day_rate: per_day.toFixed(2),
    earned_gross: earned.toFixed(2),
    pf_deduction: pf.toFixed(2),
    esi_deduction: esi.toFixed(2),
    tds_deduction: tds.toFixed(2),
    advance_deduction: advance.toFixed(2),
    other_deduction: other.toFixed(2),
    total_deductions: total_deductions.toFixed(2),
    net_pay: net_pay.toFixed(2),
  };
}

// ── Token store (in-memory, 10-min TTL) ──────────────────────────────────────
const payslipTokens = new Map();

function amountToWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function words(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + words(n % 100) : '');
    if (n < 100000) return words(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + words(n % 1000) : '');
    if (n < 10000000) return words(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + words(n % 100000) : '');
    return words(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + words(n % 10000000) : '');
  }
  const n = Math.round(parseFloat(amount));
  return n === 0 ? 'Zero Rupees Only' : words(n) + ' Rupees Only';
}

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// ── Public: Aadhar duplicate check (AJAX) ────────────────────────────────────
exports.checkAadhar = async (req, res) => {
  const { aadhar_number } = req.body;
  if (!aadhar_number || !/^\d{12}$/.test(aadhar_number))
    return res.json({ exists: false, valid: false });
  const existing = await q1('SELECT id FROM teachers WHERE aadhar_number = ?', [aadhar_number]);
  res.json({ exists: !!existing, valid: true });
};

// ── Public: Registration form ─────────────────────────────────────────────────
exports.registerPage = (req, res) => {
  res.render('main/teachers-register', {
    title: 'Teacher Registration | Greenwood High School',
    canonicalUrl: `https://${process.env.MAIN_DOMAIN || 'ghs.sc.in'}/teachers/register`,
    success: req.query.success || null,
    error: null,
    formData: {},
    errorStep: 1,
  });
};

// ── Public: Submit registration ───────────────────────────────────────────────
exports.registerSubmit = (req, res, next) => {
  profileUpload(req, res, async (err) => {
    const renderErr = (msg, errorStep = 1) => res.render('main/teachers-register', {
      title: 'Teacher Registration | Greenwood High School',
      canonicalUrl: `https://${process.env.MAIN_DOMAIN || 'ghs.sc.in'}/teachers/register`,
      success: null,
      error: msg,
      formData: req.body || {},
      errorStep,
    });

    if (err) return renderErr(err.message);

    const b = req.body;
    const { aadhar_number, full_name, email, phone, date_of_birth, gender,
            blood_group, designation,
            emergency_contact_name, emergency_contact_relation, emergency_contact_mobile,
            street, pincode, state,
            tenth_board, tenth_year, tenth_percentage,
            twelfth_board, twelfth_year, twelfth_percentage,
            ug_degree, ug_university, ug_year, ug_percentage,
            bed_board, bed_year, bed_percentage,
            med_board, med_year, med_percentage,
            previous_school, previous_classes, previous_subjects,
            current_branch, current_class, current_subject,
            bank_name, account_number, ifsc_code, pan_number,
            pf_number, esi_number } = b;

    if (!aadhar_number || aadhar_number.length !== 12 || !/^\d{12}$/.test(aadhar_number))
      return renderErr('Aadhar number must be exactly 12 digits.', 1);
    if (!full_name || !email || !phone || !date_of_birth || !gender)
      return renderErr('Please fill all required personal details.', 1);
    if (!street || !pincode || !state)
      return renderErr('Please fill your complete address.', 2);
    if (!tenth_board || !twelfth_board || !ug_degree)
      return renderErr('10th, 12th, and Undergraduate qualification details are required.', 3);
    if (!current_branch || !bank_name || !account_number || !ifsc_code || !pan_number)
      return renderErr('Branch and bank details are required.', 6);

    const existing = await q1('SELECT id FROM teachers WHERE aadhar_number = ?', [aadhar_number]);
    if (existing) return renderErr('This Aadhar number is already registered. Please contact admin if this is an error.', 1);

    const profile_pic = req.file ? `/uploads/teachers/${req.file.filename}` : null;

    const edu_tenth   = JSON.stringify({ board: tenth_board, year: tenth_year, percentage: tenth_percentage });
    const edu_twelfth = JSON.stringify({ board: twelfth_board, year: twelfth_year, percentage: twelfth_percentage });
    const edu_ug      = JSON.stringify({ degree: ug_degree, university: ug_university, year: ug_year, percentage: ug_percentage });
    const edu_bed     = bed_board ? JSON.stringify({ board: bed_board, year: bed_year, percentage: bed_percentage }) : null;
    const edu_med     = med_board ? JSON.stringify({ board: med_board, year: med_year, percentage: med_percentage }) : null;

    const prev_classes  = Array.isArray(previous_classes)  ? JSON.stringify(previous_classes)  : (previous_classes ? JSON.stringify([previous_classes]) : null);
    const prev_subjects = Array.isArray(previous_subjects) ? JSON.stringify(previous_subjects) : (previous_subjects ? JSON.stringify([previous_subjects]) : null);

    try {
      await q(`INSERT INTO teachers
        (aadhar_number, profile_pic, full_name, email, phone, date_of_birth, gender, blood_group, designation,
         emergency_contact_name, emergency_contact_relation, emergency_contact_mobile,
         street, pincode, state,
         edu_tenth, edu_twelfth, edu_ug, edu_bed, edu_med,
         previous_school, previous_classes, previous_subjects,
         current_branch, current_class, current_subject,
         bank_name, account_number, ifsc_code, pan_number, pf_number, esi_number)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [aadhar_number, profile_pic, full_name, email, phone, date_of_birth, gender,
         blood_group || null, designation || null,
         emergency_contact_name || null, emergency_contact_relation || null, emergency_contact_mobile || null,
         street, pincode, state,
         edu_tenth, edu_twelfth, edu_ug, edu_bed, edu_med,
         previous_school || null, prev_classes, prev_subjects,
         current_branch, current_class || null, current_subject || null,
         bank_name, account_number, ifsc_code, pan_number,
         pf_number || null, esi_number || null]);

      return res.redirect('/teachers/register?success=1');
    } catch (e) {
      console.error(e);
      return renderErr('Registration failed. Please try again.');
    }
  });
};

// ── Public: Pay slip validation page ─────────────────────────────────────────
exports.payslipPage = (req, res) => {
  res.render('main/payslip', {
    title: 'Staff Pay Slip | Greenwood High School',
    canonicalUrl: `https://${process.env.MAIN_DOMAIN || 'ghs.sc.in'}/payslip`,
        error: null,
    slip: null,
    calc: null,
    monthName: null,
  });
};

// ── Public: Validate and show pay slip ───────────────────────────────────────
exports.payslipValidate = async (req, res) => {
  const renderErr = (msg) => res.render('main/payslip', {
    title: 'Staff Pay Slip | Greenwood High School',
    canonicalUrl: `https://${process.env.MAIN_DOMAIN || 'ghs.sc.in'}/payslip`,
        error: msg, slip: null, calc: null, monthName: null,
  });

  const { identifier, date_of_birth, month, year } = req.body;
  if (!identifier || !date_of_birth || !month || !year) return renderErr('All fields are required.');

  const teacher = await q1(
    `SELECT * FROM teachers WHERE (teacher_id = ? OR cbse_reg_number = ?) AND status = 'approved'`,
    [identifier, identifier]
  );
  if (!teacher) return renderErr('No approved teacher found with that ID.');

  const dob = new Date(teacher.date_of_birth).toISOString().split('T')[0];
  if (dob !== date_of_birth) return renderErr('Date of birth does not match.');

  const entry = await q1(
    `SELECT * FROM teacher_payroll_entries WHERE teacher_id = ? AND month = ? AND year = ? AND enabled = 1`,
    [teacher.id, month, year]
  );
  if (!entry) return renderErr(`Pay slip for ${MONTH_NAMES[parseInt(month)]} ${year} has not been released yet. Please contact the school admin or try a different month.`);

  const calc = calcPayroll(teacher, entry);

  res.render('main/payslip', {
    title: 'Staff Pay Slip | Greenwood High School',
    canonicalUrl: `https://${process.env.MAIN_DOMAIN || 'ghs.sc.in'}/payslip`,
        error: null,
    slip: teacher,
    entry,
    calc,
    monthName: MONTH_NAMES[parseInt(month)],
    year,
    amountInWords: amountToWords(calc.net_pay),
  });
};
