const nodemailer = require('nodemailer');

let transport = null;

function getTransport() {
  if (transport) return transport;
  if (!process.env.MAIL_PASS) return null;
  const port = parseInt(process.env.MAIL_PORT || '587');
  transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.office365.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  return transport;
}

async function sendMail({ to, subject, html }) {
  const t = getTransport();
  if (!t) return; // silently skip in dev when MAIL_PASS not set
  await t.sendMail({
    from: process.env.MAIL_FROM || `Greenwood High School <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}

async function notifyAdmissionEnquiry(data) {
  await sendMail({
    to: process.env.MAIL_USER,
    subject: `New Admission Enquiry — ${data.campus} Campus`,
    html: `
      <h2>New Admission Enquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Parent Name</strong></td><td style="padding:8px;border:1px solid #ddd">${data.parent_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd">${data.phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${data.email || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Student Name</strong></td><td style="padding:8px;border:1px solid #ddd">${data.student_name || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Class Seeking</strong></td><td style="padding:8px;border:1px solid #ddd">${data.class_seeking || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Campus</strong></td><td style="padding:8px;border:1px solid #ddd">${data.campus}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Message</strong></td><td style="padding:8px;border:1px solid #ddd">${data.message || '—'}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666">View all enquiries at <a href="https://admin.ghs.ac.in/admissions">admin.ghs.ac.in/admissions</a></p>
    `,
  });
}

async function notifyContactSubmission(data) {
  await sendMail({
    to: process.env.MAIL_USER,
    subject: `New Contact Form — ${data.subject || 'General Enquiry'}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Name</strong></td><td style="padding:8px;border:1px solid #ddd">${data.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd">${data.phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${data.email || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Subject</strong></td><td style="padding:8px;border:1px solid #ddd">${data.subject || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Message</strong></td><td style="padding:8px;border:1px solid #ddd">${data.message}</td></tr>
      </table>
    `,
  });
}

async function autoReplyAdmissionEnquiry(data) {
  if (!data.email) return; // no email to reply to
  await sendMail({
    to: data.email,
    subject: `Thank you for your enquiry — Greenwood High School`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#00663A;padding:24px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0;font-size:1.2rem">Greenwood High School</h2>
          <p style="color:#B5D236;margin:4px 0 0;font-size:.85rem">Warangal, Telangana</p>
        </div>
        <div style="padding:24px;background:#f9f9f9;border-radius:0 0 8px 8px">
          <p>Dear ${data.parent_name},</p>
          <p>Thank you for your interest in Greenwood High School! We have received your admission enquiry for <strong>${data.student_name || 'your child'}</strong> (Class ${data.class_seeking || '—'}) at our <strong>${data.campus}</strong> campus.</p>
          <p>Our admissions team will contact you shortly on <strong>${data.phone}</strong> to guide you through the next steps.</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:16px 0">
          <p style="font-size:.85rem;color:#666">For immediate assistance, call us at <a href="tel:+919866514515">+91 9866514515</a> or WhatsApp us.</p>
          <p style="font-size:.85rem;color:#666">— The Admissions Team, Greenwood High School</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendMail, notifyAdmissionEnquiry, notifyContactSubmission, autoReplyAdmissionEnquiry };
