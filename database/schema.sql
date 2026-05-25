-- Greenwood High School — Database Schema
-- Run this once to create all tables
-- NOTE: Select your database in phpMyAdmin before importing (do not run CREATE DATABASE here)

-- Admin users
CREATE TABLE IF NOT EXISTS admins (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  role        ENUM('super','branch') DEFAULT 'branch',
  campus      VARCHAR(50) DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  session_id  VARCHAR(128) PRIMARY KEY,
  expires     INT(11) UNSIGNED NOT NULL,
  data        MEDIUMTEXT
);

-- Notices & Circulars
CREATE TABLE IF NOT EXISTS notices (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(500) NOT NULL,
  content     TEXT NOT NULL,
  campus      VARCHAR(50) DEFAULT 'all',
  category    ENUM('general','circular','exam','holiday','urgent') DEFAULT 'general',
  is_active   TINYINT(1) DEFAULT 1,
  created_by  INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Events (local + GTimes-synced)
CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  campus      VARCHAR(50) DEFAULT 'all',
  event_date  DATE DEFAULT NULL,
  image       VARCHAR(300) DEFAULT NULL,
  category    VARCHAR(100) DEFAULT 'general',
  source      ENUM('local','gtimes') DEFAULT 'local',
  gtimes_id   VARCHAR(100) DEFAULT NULL,
  gtimes_url  VARCHAR(500) DEFAULT NULL,
  is_active   TINYINT(1) DEFAULT 1,
  created_by  INT DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_gtimes_event (gtimes_id),
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- News Articles (local + GTimes-synced)
CREATE TABLE IF NOT EXISTS articles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(500) NOT NULL,
  excerpt      TEXT,
  content      LONGTEXT,
  campus       VARCHAR(50) DEFAULT 'all',
  category     VARCHAR(100) DEFAULT 'news',
  author       VARCHAR(200) DEFAULT NULL,
  image        VARCHAR(300) DEFAULT NULL,
  source       ENUM('local','gtimes') DEFAULT 'local',
  gtimes_id    VARCHAR(100) DEFAULT NULL,
  gtimes_url   VARCHAR(500) DEFAULT NULL,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active    TINYINT(1) DEFAULT 1,
  created_by   INT DEFAULT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_gtimes_article (gtimes_id),
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  filename    VARCHAR(300) NOT NULL,
  caption     VARCHAR(500) DEFAULT NULL,
  campus      VARCHAR(50) DEFAULT 'main',
  category    VARCHAR(100) DEFAULT 'general',
  is_active   TINYINT(1) DEFAULT 1,
  uploaded_by INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Faculty
CREATE TABLE IF NOT EXISTS faculty (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  campus        VARCHAR(50) NOT NULL,
  name          VARCHAR(300) NOT NULL,
  designation   VARCHAR(300) NOT NULL,
  subject       VARCHAR(200) DEFAULT NULL,
  qualification VARCHAR(300) DEFAULT NULL,
  experience    VARCHAR(100) DEFAULT NULL,
  photo         VARCHAR(300) DEFAULT NULL,
  sort_order    INT DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CBSE / State Board Compliance Documents
CREATE TABLE IF NOT EXISTS compliance_documents (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  campus      VARCHAR(50) NOT NULL,
  doc_type    VARCHAR(100) NOT NULL,
  label       VARCHAR(500) NOT NULL,
  filename    VARCHAR(300) NOT NULL,
  year        VARCHAR(10) DEFAULT NULL,
  sort_order  INT DEFAULT 0,
  is_active   TINYINT(1) DEFAULT 1,
  uploaded_by INT DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Downloads
CREATE TABLE IF NOT EXISTS downloads (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  campus      VARCHAR(50) DEFAULT 'all',
  label       VARCHAR(500) NOT NULL,
  filename    VARCHAR(300) NOT NULL,
  category    ENUM('academic','admission','circular','form','calendar','result','other') DEFAULT 'other',
  is_active   TINYINT(1) DEFAULT 1,
  uploaded_by INT DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Admission Enquiries
CREATE TABLE IF NOT EXISTS admission_enquiries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  parent_name   VARCHAR(300) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  email         VARCHAR(200) DEFAULT NULL,
  student_name  VARCHAR(300) DEFAULT NULL,
  class_seeking VARCHAR(50) DEFAULT NULL,
  campus        VARCHAR(50) NOT NULL,
  message       TEXT DEFAULT NULL,
  status        ENUM('new','contacted','enrolled','closed') DEFAULT 'new',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(300) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  email       VARCHAR(200) DEFAULT NULL,
  subject     VARCHAR(500) DEFAULT NULL,
  message     TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(300) NOT NULL,
  role        VARCHAR(200) DEFAULT 'Parent',
  campus      VARCHAR(100) DEFAULT NULL,
  quote       TEXT NOT NULL,
  photo       VARCHAR(300) DEFAULT NULL,
  is_active   TINYINT(1) DEFAULT 1,
  sort_order  INT DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(200) NOT NULL UNIQUE,
  name       VARCHAR(200) DEFAULT NULL,
  token      VARCHAR(64)  NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migration: run if upgrading existing DB
-- ALTER TABLE testimonials ... (new table, no migration needed)
-- ALTER TABLE newsletter_subscribers ... (new table, no migration needed)

-- Migration: update admission year from 2025-26 to 2026-27
UPDATE settings SET value='2026-27' WHERE setting_key='admission_year' AND value='2025-26';

-- Migration: add Google Reviews columns to testimonials
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating    TINYINT      DEFAULT 5;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS source    VARCHAR(20)  DEFAULT 'manual';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS source_id VARCHAR(200) DEFAULT NULL;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL;

-- Site settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  value       TEXT,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default admin (password: greenwood@admin — CHANGE IMMEDIATELY after first login)
INSERT IGNORE INTO admins (username, password, name, role)
VALUES ('admin', '$2b$10$FYmK8Q/xQ3jxokXbxQEJ9Oz2metBrfknl8ja46D8cRjiCFhDyH4D6', 'Super Admin', 'super');

-- Default settings
INSERT IGNORE INTO settings (setting_key, value) VALUES
  ('admissions_open', '1'),
  ('admission_year', '2026-27'),
  ('phone_main', '+91 XXXXXXXXXX'),
  ('email_main', 'office@ghs.ac.in'),
  ('whatsapp_main', '+91 XXXXXXXXXX');
