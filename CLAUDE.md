# Greenwood High School Site

Product: Client website — Greenwood High School (GHS)
Domain: ghs.ac.in
Virora AI agents: D:\Virora-AI\agents\ | Shared context: D:\Virora-AI\

## Stack
- Runtime: Node.js + Express.js
- Templates: EJS
- Database: MySQL2 (express-mysql-session for sessions)
- Session: express-session
- Email: Nodemailer (Hostinger SMTP — office@ghs.ac.in)
- File upload: Multer (uploads stored at UPLOADS_DIR, outside repo)
- Security: Helmet, express-rate-limit, express-validator
- Port: 3000

## MVC structure
- app.js — entry point
- controllers/, routes/, views/, models/, middleware/, services/, utils/, public/
- campuses/ — multi-campus support (subdomain detection via MAIN_DOMAIN env var)
  - Dev: MAIN_DOMAIN=lvh.me | Production: MAIN_DOMAIN=ghs.ac.in

## Webhook integration (critical)
Greenwood RECEIVES content from GTimes on article/event/gallery publish:
- Endpoint: POST /api/gtimes/sync
- Auth: GTIMES_WEBHOOK_SECRET (must match GTimes' GREENWOOD_WEBHOOK_SECRET)
- Synced albums stored in gallery_albums table

## Architecture constraints
- Uploads: UPLOADS_DIR env var — persistent path OUTSIDE repo on production
- Subdomain detection: MAIN_DOMAIN env var controls campus routing
- GTimes webhook secret must stay in sync with GTimes env

## Context rule
Repository is the source of truth. If this file conflicts with current code/config, flag CONTEXT DRIFT.
