-- Teachers Management — run after schema.sql
-- Two tables: teachers (registration) + teacher_payroll_entries (monthly payroll)

CREATE TABLE IF NOT EXISTS teachers (
  id                        INT AUTO_INCREMENT PRIMARY KEY,

  -- Identity
  aadhar_number             VARCHAR(12) NOT NULL UNIQUE,
  teacher_id                VARCHAR(20) DEFAULT NULL UNIQUE,
  cbse_reg_number           VARCHAR(50) DEFAULT NULL,

  -- Profile
  profile_pic               VARCHAR(500) DEFAULT NULL,
  full_name                 VARCHAR(200) NOT NULL,
  email                     VARCHAR(200) NOT NULL,
  phone                     VARCHAR(15) NOT NULL,
  date_of_birth             DATE NOT NULL,
  gender                    ENUM('Male','Female','Other') NOT NULL,
  blood_group               VARCHAR(5) DEFAULT NULL,
  designation               VARCHAR(100) DEFAULT NULL,

  -- Emergency Contact
  emergency_contact_name    VARCHAR(200) DEFAULT NULL,
  emergency_contact_relation VARCHAR(50) DEFAULT NULL,
  emergency_contact_mobile  VARCHAR(15) DEFAULT NULL,

  -- Address
  street                    TEXT NOT NULL,
  pincode                   VARCHAR(6) NOT NULL,
  state                     VARCHAR(100) NOT NULL,

  -- Education (10th, 12th, UG stored as JSON; PG/B.Ed/M.Ed optional)
  edu_tenth                 JSON DEFAULT NULL,
  edu_twelfth               JSON DEFAULT NULL,
  edu_ug                    JSON DEFAULT NULL,
  edu_pg                    JSON DEFAULT NULL,
  edu_bed                   JSON DEFAULT NULL,
  edu_med                   JSON DEFAULT NULL,

  -- Experience
  previous_school           VARCHAR(300) DEFAULT NULL,
  previous_classes          JSON DEFAULT NULL,
  previous_subjects         JSON DEFAULT NULL,

  -- Current Position
  current_branch            VARCHAR(200) NOT NULL,
  current_class             VARCHAR(20) DEFAULT NULL,
  current_subject           VARCHAR(100) DEFAULT NULL,

  -- Bank & Official
  bank_name                 VARCHAR(200) NOT NULL,
  account_number            VARCHAR(50) NOT NULL,
  ifsc_code                 VARCHAR(11) NOT NULL,
  pan_number                VARCHAR(10) NOT NULL,
  pf_number                 VARCHAR(50) DEFAULT NULL,
  esi_number                VARCHAR(50) DEFAULT NULL,

  -- Salary Structure (admin-assigned)
  salary_basic              DECIMAL(10,2) DEFAULT 0,
  salary_hra                DECIMAL(10,2) DEFAULT 0,
  salary_da                 DECIMAL(10,2) DEFAULT 0,
  salary_transport          DECIMAL(10,2) DEFAULT 0,
  pf_percent                DECIMAL(5,2) DEFAULT 12.00,
  esi_percent               DECIMAL(5,2) DEFAULT 0.75,
  tds_flat                  DECIMAL(10,2) DEFAULT 0,

  -- Status
  status                    ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_payroll_entries (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id                INT NOT NULL,
  month                     TINYINT NOT NULL COMMENT '1-12',
  year                      SMALLINT NOT NULL,

  days_in_month             TINYINT NOT NULL DEFAULT 26,
  days_present              TINYINT NOT NULL DEFAULT 0,
  advance_deduction         DECIMAL(10,2) DEFAULT 0,
  other_deduction_amount    DECIMAL(10,2) DEFAULT 0,
  other_deduction_label     VARCHAR(100) DEFAULT NULL,
  bonus                     DECIMAL(10,2) DEFAULT 0,
  remarks                   TEXT DEFAULT NULL,

  enabled                   TINYINT(1) DEFAULT 0,
  enabled_at                DATETIME DEFAULT NULL,
  created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_teacher_month (teacher_id, month, year),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);
