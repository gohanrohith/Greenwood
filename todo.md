# Greenwood High School — Project TODO

## Status: Development complete. Pending content + deployment.

---

## 1. Content Needed From Client ⏳ PENDING

- [x] Phone numbers — all 5 campuses filled
- [x] WhatsApp numbers — 4 campuses filled
- [x] Principal names — all 5 filled
- [x] CBSE affiliation numbers (Hasanparthy: 3630081, Hunter Road: 130446, Mancherial: 3630559)
- [x] CBSE school codes (Hasanparthy: 57599, Hunter Road: 57714, Mancherial: 57308)
- [ ] **Mancherial WhatsApp number** (only one missing — add to `config/campuses.js`)
- [ ] **Google Maps embed URLs** for all 5 campuses → `mapEmbed` in campus JSON
- [ ] **Student strength count** per campus
- [ ] **Hero images × 3** → `/public/images/hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`
- [ ] **Campus photos** → `/public/images/campuses/{slug}.jpg` and `{slug}-hero.jpg`
- [ ] **Director photos** → `/public/images/directors/cdr.jpg` and `gbn.jpg`
- [ ] **About page photo** → `/public/images/about-home.jpg`
- [ ] **Favicon** → `public/favicon.ico` (32×32) + `public/favicon.png` (512×512)
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
- [ ] **Run DB migration** — add `concern_submissions` table: `CREATE TABLE IF NOT EXISTS concern_submissions ...` (see schema.sql)

---

## 10. Deliberately Not Built (out of scope)

- [ ] **Online fee payment** — no Razorpay/PayU integration
- [ ] **Alumni section** — no alumni page or registration

---

## Quick Reference — Campus Slugs

| Slug | Name | Board | Type |
|------|------|-------|------|
| hasanparthy | Hasanparthy Campus | CBSE | Residential |
| hunterroad | Hunter Road Campus | CBSE | Day Scholar |
| naimnagar | Naimnagar Campus | State Board | Day Scholar |
| mancherial | Mancherial Campus | CBSE | Day Scholar |
| gopalpur | Gopalpur Campus | State Board | Day Scholar |
