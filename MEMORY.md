# Greenwood High School — Session Memory

**Client:** Greenwood High School (Virora International client)
**Repo:** `D:\Greenwood`
**Type:** Multi-campus school website — full end-to-end management by Virora

---

## Stack
| Layer | Detail |
|---|---|
| Framework | Node.js + Express.js |
| Templates | EJS (server-side rendered) |
| Database | MySQL (session store + all content) |
| Session | express-session + MySQLStore (SafeStore fallback) |
| Email | Nodemailer (Hostinger SMTP) |
| Port | 3000 |

## Run locally
```bash
npm run dev    # http://lvh.me:3000 (main) or http://lvh.me:3000/hasanparthy etc.
```

---

## Campus Slugs
| Slug | Name | Board |
|---|---|---|
| hasanparthy | Hasanparthy Campus | CBSE · Residential |
| hunterroad | Hunter Road Campus | CBSE · Day Scholar |
| naimnagar | Naimnagar Campus | State Board · Day Scholar |
| mancherial | Mancherial Campus | CBSE · Day Scholar |
| gopalpur | Gopalpur Campus | State Board · Day Scholar |

Campus data in `campuses/*.json` — each has phone, WhatsApp, principal, CBSE codes, Maps embed URL.

---

## Architecture
Single Express app serves: main site + `/admin` + 5 campus sub-routes (`/hasanparthy`, `/hunterroad`, etc.).
- Routes: `main.js`, `campus.js`, `admin.js`, `api.js`, `teachers.js`
- GTimes webhook receiver: `POST /api/gtimes/sync` — upserts articles/events from GTimes

---

## Current Status
**Dev complete.** Pending content + deployment.

**Content still needed:**
- Hero images × 3 (`/public/images/hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`)
- Campus photos (`/public/images/campuses/{slug}.jpg` and `{slug}-hero.jpg`)
- Director photos (`/public/images/directors/cdr.jpg`, `gbn.jpg`)
- About page photo (`/public/images/about-home.jpg`)
- OG image (`/public/images/og-image.jpg` — 1200×630)
- Student strength count per campus
- Social media handles → `config/school.js`

**Known bugs:** See `todo.md` section 10.
**Missing admin features:** See `todo.md` section 11.

---

## Teachers Management System (Pending — Phase 0–6)
Separate Next.js 15 + MongoDB + Cloudinary app for teacher payslips.
Full spec in `todo.md` sections 15 onwards. 15 new files + 9 modified files.
Zero new npm packages required.

---

## Last Session (2026-07-27)
- Read and understood full project structure
- No code changes made

---

## Next Up
1. Receive and upload hero/campus/director images from client
2. Fix known bugs in `todo.md` section 10 (session cookie, sitemap, apiController image overwrite)
3. Build Teachers Management System (Phase 0 = rebrand → Phase 6 = public payslip page)

---

## Key Files
| File | Purpose |
|---|---|
| `app.js` | Express app entry, session config, route mounts |
| `campuses/*.json` | Per-campus data (phone, WhatsApp, principal, Maps, CBSE codes) |
| `controllers/adminController.js` | Admin dashboard, all admin actions |
| `controllers/campusController.js` | Campus sub-site pages |
| `controllers/mainController.js` | Main site pages + sitemap |
| `database/schema.sql` | Full MySQL schema |
| `todo.md` | Detailed TODO: bugs, missing features, deployment checklist, teachers system spec |
