# Greenwood High School — Project TODO

## Status: Development complete. Pending content + deployment.

---

## 1. Content Needed From Client ⏳ PENDING

- [x] Phone numbers — all 5 campuses filled
- [x] WhatsApp numbers — 4 campuses filled
- [x] Principal names — all 5 filled
- [x] CBSE affiliation numbers (Hasanparthy: 3630081, Hunter Road: 130446, Mancherial: 3630559)
- [x] CBSE school codes (Hasanparthy: 57599, Hunter Road: 57714, Mancherial: 57308)
- [x] **Mancherial WhatsApp number** — already present in `campuses/mancherial.json` (`+91 7981864817`)
- [x] **Google Maps embed URLs** — already present in all 5 campus JSON files
- [ ] **Student strength count** per campus
- [ ] **Hero images × 3** → `/public/images/hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`
- [ ] **Campus photos** → `/public/images/campuses/{slug}.jpg` and `{slug}-hero.jpg`
- [ ] **Director photos** → `/public/images/directors/cdr.jpg` and `gbn.jpg`
- [ ] **About page photo** → `/public/images/about-home.jpg`
- [x] **Favicon** → `public/emblem.png` used as icon in all layouts (`/emblem.png`)
- [ ] **Social media handles** (Facebook, Instagram, YouTube, Twitter/X) → `config/school.js`

---

## 2. Main Site Pages ✅ ALL DONE (11 pages + legal)

- [x] `/` — Homepage with hero, stats, about snippet, campus cards, why us, CTA, achievements, testimonials, contact mini-form
- [x] `/about` — School history, leadership, mission/vision
- [x] `/campuses` — All 5 campus cards
- [x] `/academics` — Curriculum, boards, class structure
- [x] `/facilities` — Labs, library, sports, transport
- [x] `/admissions` — Enquiry form with DB + admin notification + auto-reply email
- [x] `/achievements` — Toppers, olympiads, sports
- [x] `/news` — Events + GTimes articles feed
- [x] `/gallery` — Photo grid
- [x] `/careers` — Job openings (static)
- [x] `/contact` — Contact form with DB + admin notification
- [x] `/compliance` — CBSE / State Board transparency
- [x] `/search` — Search across notices, events, articles
- [x] `/newsletter/subscribe` — POST endpoint with token generation
- [x] `/newsletter/unsubscribe` — GET with token
- [x] `/sitemap.xml` — Dynamic sitemap for all campus subdomains
- [x] `/robots.txt` — Disallows /admin
- [x] Legal pages: privacy-policy, terms, child-protection, anti-bullying, posh, refund, cookie, media-consent

---

## 3. Campus Sub-site Pages ✅ ALL DONE

- [x] `/` — Campus homepage (events, notices, gallery)
- [x] `/about` — Campus-specific about
- [x] `/academics` — CBSE vs State Board conditional content
- [x] `/faculty` — Fetched from DB by campus
- [x] `/facilities`
- [x] `/events` — Campus events
- [x] `/gallery` — Campus gallery
- [x] `/notices` — Campus + all notices
- [x] `/downloads` — Campus downloads
- [x] `/admissions` — Campus admission enquiry form
- [x] `/contact` — Campus contact form
- [x] `/disclosure` — CBSE Mandatory Disclosure (CBSE campuses) / School Info (State Board)

---

## 4. Admin Panel ✅ ALL DONE

- [x] `/login` — Auth with bcrypt
- [x] `/` — Dashboard: stats cards + recent enquiries
- [x] `/notices` — Create, list, soft-delete
- [x] `/events` — Create, list, soft-delete
- [x] `/gallery` — Upload (magic byte validated), list, soft-delete
- [x] `/admissions` — Filter by status/campus, view detail, update status
- [x] `/faculty` — Photo upload, list by campus, soft-delete
- [x] `/compliance` — Upload compliance docs, list by campus/type, soft-delete
- [x] `/downloads` — Upload downloads, list by campus/category, soft-delete
- [x] `/testimonials` — Add testimonial with campus/role, list, soft-delete
- [x] `/newsletter` — List subscribers with count, delete
- [x] `/settings` — Admissions open toggle, year, phone, WhatsApp, password change

---

## 5. Features ✅ ALL BUILT

- [x] Multi-site routing: main / admin / 5 campus subdomains — single Express app
- [x] Session-based admin auth (MySQLStore)
- [x] CSRF protection on all form routes
- [x] Rate limiting: form submissions + API webhook
- [x] express-validator on admission and contact forms
- [x] Multer with magic byte validation (JPG/PNG/GIF/WebP for images; PDF/DOC/XLS for docs)
- [x] Nodemailer (Hostinger SMTP): admin notifications + auto-reply to enquirer
- [x] Testimonials — DB-backed, admin-managed, homepage displays with fallback to 3 hardcoded
- [x] Newsletter — subscribe/unsubscribe with crypto token, admin list view
- [x] Search — full-text LIKE across notices, events, articles
- [x] GTimes webhook receiver: `POST /api/gtimes/sync` — upserts articles/events from GTimes
- [x] WhatsApp float button on every main + campus page (footer partials)
- [x] Cookie consent banner on every main + campus page (localStorage key `ghs_cookie_consent`)
- [x] Dynamic sitemap.xml covering main + all 5 campus subdomains
- [x] SEO: Open Graph, Twitter Card, JSON-LD SchoolOrganization on homepage, canonical URLs
- [x] Legal pages (8 pages): privacy, terms, child protection, anti-bullying, POSH, refund, cookie, media consent

---

## 6. Security ✅ ALL DONE

- [x] No hardcoded credentials (all in `.env`)
- [x] bcrypt password hashing
- [x] Rate limiting on all public POST routes
- [x] CSRF tokens on all forms
- [x] File upload magic byte validation
- [x] Helmet.js HTTP security headers
- [x] SQL parameterised queries (no string interpolation)

---

## 7. Database Schema ✅ COMPLETE

Tables: `admins`, `sessions`, `notices`, `events`, `articles`, `gallery`, `faculty`, `compliance_documents`, `downloads`, `admission_enquiries`, `contact_submissions`, `testimonials`, `newsletter_subscribers`, `settings`

---

## 8. Deployment Checklist ⏳ PENDING

- [ ] Upload content files (images, favicon) to `/public/`
- [ ] `cp .env.example .env` and fill in all values
- [ ] Set `NODE_ENV=production`
- [ ] Set `MAIN_DOMAIN=ghs.ac.in`
- [ ] Set `GTIMES_WEBHOOK_SECRET` (must match gtimes `.env`)
- [ ] Configure Hostinger SMTP credentials in `.env`
- [ ] Run `schema.sql` on production MySQL
- [ ] Change default admin password on first login
- [ ] Point `ghs.ac.in` + all 5 campus subdomains to server IP (A records)
- [ ] SSL certificates for all 6 domains
- [ ] Configure Nginx reverse proxy (port 3000)
- [ ] Set up PM2: `pm2 start app.js --name greenwood`
- [ ] Ensure `/public/uploads/` subdirs exist and are writable
- [ ] Test form submissions — confirm admin notification emails received
- [ ] Test gallery upload on each campus

---

## 9. Concerns & Queries Module ✅ DONE

- [x] `/concern` — Public form (name, phone, email, campus, category, message)
- [x] DB table `concern_submissions` with status workflow (new → in_progress → resolved → closed)
- [x] Telegram notification on submission via `whatsappConcernForm`
- [x] Admin module at `/admin/concerns` — filter by status/campus, inline status update, admin notes
- [x] Footer link only (not in main nav)
- [x] **Run DB migration** — `CREATE TABLE IF NOT EXISTS concern_submissions` is in `schema.sql`

---

## 10. Bugs Found

### `app.js`
- [ ] Session cookie `secure: false` is hardcoded — change to `secure: process.env.NODE_ENV === 'production'` so cookies are HTTPS-only in production (`app.js:35`)

### `controllers/apiController.js`
- [ ] GTimes UPDATE path always overwrites `image` field with freshly downloaded value — if `fetchImage()` returns `null` (network failure / 404), the existing image in DB gets wiped. Fix: only update `image` when the new download succeeds

### `controllers/mainController.js`
- [ ] Sitemap is missing many main pages: `/careers`, `/skill-labs`, `/news`, `/gallery`, `/contact`, `/compliance`, `/search`, `/concern` — add them to `mainPages` array in `exports.sitemap`
- [ ] Sitemap and `robots.txt` hardcode `ghs.ac.in` instead of using `process.env.MAIN_DOMAIN` — breaks staging / dev environments
- [ ] `/?newsletter=success` query param is never read — after subscribing the user is redirected there but the homepage has no feedback. Add a success toast/banner for `req.query.newsletter === 'success'`

### `campuses/*.json` — brand colours
- [ ] All 5 campus JSON files have non-brand `theme` colours (e.g. `#1a5276`, `#145a32`, `#6c3483`, `#d35400`, `#f39c12`). Decide: either remap to official palette (`#00663A` / `#B5D236` / `#1F1B76`) or remove the `theme` block if it is unused by templates

---

## 11. Missing Admin Features

- [ ] **Contact submissions admin view** — `contact_submissions` table is populated by the contact form but there is no `/admin/contacts` route or view to read them. Add list + soft-delete (mirrors admissions pattern)
- [ ] **Admin dashboard — concerns count** — `concern_submissions` is not counted in dashboard stats; add it alongside the other 5 stat cards (`adminController.js: exports.dashboard`)
- [ ] **Newsletter broadcast** — admin can list/delete subscribers but has no way to send a newsletter to all of them. Add a simple compose + send-all endpoint when needed (Phase 2)

---

## 12. Missing Assets

- [ ] **OG image** — `index.ejs` references `/images/og-image.jpg` but the file doesn't exist in `/public/`. Create or upload a 1200×630 branded image

---

## 13. Deployment Additions

- [x] **Telegram credentials in deployment checklist** — `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are in `.env.example`; covered by "fill in all values" in Section 8
- [ ] **`UPLOADS_DIR` must be set outside document root** — if left blank, uploads land in `public/uploads` which is web-accessible. On Hostinger set it to an absolute path outside the project (e.g. `/home/u123456789/uploads`) to prevent direct URL access to compliance docs and faculty photos

---

## 14. Deliberately Not Built (out of scope)

- [ ] **Online fee payment** — no Razorpay/PayU integration
- [ ] **Alumni section** — no alumni page or registration

---

## 15. Teachers Management System ⏳ TO BUILD

Separate app at `G:\Teachers Management` (Next.js 15 + TypeScript + MongoDB + Cloudinary).
Three access layers: public registration → admin management → pay slip gate.

### Phase 0 — Rebrand to Greenwood ⏳
Replace generic Tailwind emerald/blue/purple with official Greenwood palette. Add Outfit font.

| File | Change |
|---|---|
| `src/app/layout.tsx` | Add `Outfit` font via `next/font/google` |
| `src/app/page.tsx` | Swap gradient + card colors |
| `src/app/login/page.tsx` | `blue-600` → `[#1F1B76]` |
| `src/app/admin/page.tsx` | Stat card border/text colors, header gradient |
| `src/components/AdminTable.tsx` | Filter chips, status badges, button colors |
| `src/components/RegistrationForm.tsx` | Step indicator, buttons, progress bar |
| `src/components/ui/button.tsx` | Default variant: emerald → `[#00663A]` |

Color mapping: `emerald-*` → `[#00663A]`, headings → `[#1F1B76]`, accents → `[#B5D236]`

---

### Phase 1 — Teacher Model Updates ⏳
**File:** `src/lib/models/Teacher.ts`

Add fields:
- `teacher_id` — String, unique, sparse (admin-assigned after approval e.g. `GHS-001`)
- `cbse_reg_number` — String, optional
- `designation` — String
- `salary_basic`, `salary_hra`, `salary_da`, `salary_transport` — Number (₹)
- `pf_percent` — Number, default 12
- `esi_percent` — Number, default 0.75
- `tds_flat` — Number, default 0 (flat monthly TDS in ₹)

---

### Phase 2 — PayrollEntry Model (new) ⏳
**File to create:** `src/lib/models/PayrollEntry.ts`

Fields: `teacher` (ref), `month` (1–12), `year`, `days_in_month`, `days_present`,
`advance_deduction`, `other_deduction_amount`, `other_deduction_label`, `bonus`,
`remarks`, `enabled` (false by default), `enabled_at`, `created_at`, `updated_at`

Compound unique index: `{ teacher, month, year }`

---

### Phase 3 — Payroll Calculation Logic ⏳
**File to create:** `src/lib/payroll.ts` — pure function, no DB calls

```
per_day_rate  = (basic + hra + da + transport) / days_in_month
earned_gross  = (per_day_rate × days_present) + bonus
pf_deduction  = (basic / days_in_month × days_present) × (pf_percent / 100)
esi_deduction = earned_gross ≤ 21000 ? earned_gross × (esi_percent / 100) : 0
total_deduct  = pf + esi + tds_flat + advance + other_deduction
net_pay       = earned_gross − total_deduct
```

---

### Phase 4 — New API Routes ⏳

**Teacher ID & Salary:**
- `PATCH /api/teachers/[id]/salary` — save teacher_id, cbse_reg_number, designation, all salary fields
- `GET  /api/teachers/check-id?teacher_id=GHS-001` — `{ exists: boolean }` for real-time duplicate check

**Payroll Entries:**
- `GET  /api/payroll?month=12&year=2025` — all entries for month, populated with teacher name/branch/ID
- `POST /api/payroll` — upsert entry (findOneAndUpdate with upsert:true)
- `PATCH /api/payroll/[id]` — update individual entry
- `DELETE /api/payroll/[id]` — remove entry
- `POST /api/payroll/enable` — `{ month, year, enabled }` sets enabled flag on ALL entries for that month
- `GET  /api/payroll/status?month=12&year=2025` — `{ enabled, count, enabled_at }` (used by public page)

**Pay Slip Gate:**
- `POST /api/payslip/validate` — `{ teacher_id|cbse_reg_number, dob, month, year }` → validates 3 conditions (teacher exists + DOB match, entry exists, entry enabled) → returns short-lived one-time token (10-min TTL, in-memory Map)
- `GET  /api/payslip/[token]` — returns full pay slip data + calculated values, deletes token after fetch

---

### Phase 5 — Admin Pages ⏳

**`src/app/admin/teachers/[id]/page.tsx`** (new)
- Section 1: Assign Teacher ID (real-time duplicate check) + CBSE Reg No. + Designation + Salary structure form + live gross preview
- Section 2: Read-only full teacher profile

**`src/app/admin/payroll/page.tsx`** (new)
- Month + Year selector at top
- Status badge: ENABLED ✓ / NOT RELEASED
- Enable / Disable button with confirm dialog
- Inline entry table — one row per approved teacher:
  `Teacher ID | Name | Campus | Days in Month | Days Present | Advance | Other Deduction | Label | Bonus | Remarks | Live Net Preview`
- "Save All" batch button
- Bottom summary: X teachers entered, total payroll this month ₹XX,XX,XXX
- Warning badges on teachers with no salary structure (links to their detail page)

**`src/app/admin/page.tsx`** (modify)
- Add 4th stat card: "Payroll This Month" (count of entries saved for current month)
- Add "Payroll" nav link in header

**`src/components/AdminTable.tsx`** (modify)
- Add Teacher ID column (shows "Not Assigned" in muted gray if empty)
- Teacher name → link to `/admin/teachers/[id]`
- Salary status dot: green if salary configured, red if not

---

### Phase 6 — Public Pay Slip Page ⏳
**File to create:** `src/app/payslip/page.tsx`

**Step 1 — Validation form:**
Teacher ID (or CBSE Reg No.) + Date of Birth + Month + Year selector → submit

**Step 2 — Pay Slip display** (after token validated):
```
[Logo]  GREENWOOD HIGH SCHOOL — [Campus]
PAY SLIP — DECEMBER 2025
────────────────────────────────────────
Teacher ID | Name | Designation | PAN
PF No.     | ESI No. | Bank | Account (masked)
Days in Month: 26    Days Present: 24
────────────────────────────────────────
EARNINGS              DEDUCTIONS
Basic      ₹15,000   PF (12%)    ₹1,662
HRA        ₹ 6,000   ESI (0.75%) ₹  124
DA         ₹ 1,500   TDS         ₹    0
Transport  ₹ 1,000   Advance     ₹    0
Bonus      ₹     0   Other       ₹    0
Gross Earned ₹22,154  Total Ded  ₹1,786
────────────────────────────────────────
NET PAY: ₹20,368
Twenty Thousand Three Hundred Sixty Eight Rupees Only
────────────────────────────────────────
Remarks: [admin remarks]
Computer-generated pay slip. No signature required.
```
PDF: `window.print()` with `@media print` CSS — no extra npm package needed

**`src/app/page.tsx`** (modify) — add footer link "Download Pay Slip" → `/payslip`

---

### New Files to Create (15)
```
src/lib/models/PayrollEntry.ts
src/lib/payroll.ts
src/app/api/teachers/[id]/salary/route.ts
src/app/api/teachers/check-id/route.ts
src/app/api/payroll/route.ts
src/app/api/payroll/[id]/route.ts
src/app/api/payroll/enable/route.ts
src/app/api/payroll/status/route.ts
src/app/api/payslip/validate/route.ts
src/app/api/payslip/[token]/route.ts
src/app/admin/payroll/page.tsx
src/app/admin/teachers/[id]/page.tsx
src/app/payslip/page.tsx
src/components/PayrollTable.tsx
src/components/PaySlip.tsx
```

### Files to Modify (9)
```
src/lib/models/Teacher.ts              → 9 new fields
src/app/layout.tsx                     → Outfit font
src/app/page.tsx                       → rebrand + pay slip link
src/app/login/page.tsx                 → rebrand
src/app/admin/page.tsx                 → payroll stat card + nav link
src/components/AdminTable.tsx          → Teacher ID column + salary dot + detail link
src/components/RegistrationForm.tsx    → rebrand
src/components/ui/button.tsx           → rebrand default variant
src/app/api/teachers/[id]/route.ts     → handle salary fields in PATCH
```

### Build Order
```
1.  layout.tsx                   font first
2.  Rebrand all UI files         colors across all components
3.  Teacher.ts                   add new fields
4.  PayrollEntry.ts              new model
5.  payroll.ts                   calculation logic
6.  /api/teachers/[id]/salary    salary save API
7.  /api/teachers/check-id       ID duplicate check
8.  /admin/teachers/[id]         admin assigns ID + salary
9.  AdminTable.tsx               ID column + detail link
10. /api/payroll                 entry CRUD
11. /api/payroll/enable          month toggle
12. /api/payroll/status          public status check
13. PayrollTable.tsx             entry table component
14. /admin/payroll               full payroll page
15. admin/page.tsx               payroll stat card
16. /api/payslip/validate        gate logic
17. /api/payslip/[token]         data fetch
18. PaySlip.tsx                  pay slip component
19. /payslip                     public validation page
20. page.tsx (home)              pay slip footer link
```

**Zero new npm packages required.**

---

## Quick Reference — Campus Slugs

| Slug | Name | Board | Type |
|------|------|-------|------|
| hasanparthy | Hasanparthy Campus | CBSE | Residential |
| hunterroad | Hunter Road Campus | CBSE | Day Scholar |
| naimnagar | Naimnagar Campus | State Board | Day Scholar |
| mancherial | Mancherial Campus | CBSE | Day Scholar |
| gopalpur | Gopalpur Campus | State Board | Day Scholar |
