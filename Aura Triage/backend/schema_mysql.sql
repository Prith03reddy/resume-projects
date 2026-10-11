-- ==============================================================================
-- AuraTriage: MySQL / MariaDB (XAMPP Server) Production Schema
-- Mission-Critical Autonomous ER Trauma Dispatch Hub
-- Compatible with phpMyAdmin, MySQL 8+, and MariaDB 10.4+
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `auratriage` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `auratriage`;

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS `incidents`;
DROP TABLE IF EXISTS `hospitals`;
DROP TABLE IF EXISTS `patients`;

-- 1. Patients Table (EMR - Electronic Medical Record)
CREATE TABLE `patients` (
    `patient_id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `age` INT NOT NULL,
    `blood_group` VARCHAR(10) NOT NULL,
    `allergies` JSON NOT NULL,
    `chronic_conditions` JSON NOT NULL,
    `emergency_contact` VARCHAR(255) NOT NULL,
    `emergency_contact_2` VARCHAR(255) DEFAULT '+1 (555) 492-3810',
    `home_address` VARCHAR(500) DEFAULT '124 East 79th St, New York, NY 10075',
    `additional_medical_details` TEXT,
    `email` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Hospitals Table (Trauma Receiving Facilities)
CREATE TABLE `hospitals` (
    `hospital_id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `trauma_level` ENUM('1', '2', '3') NOT NULL,
    `location` POINT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    SPATIAL INDEX `idx_hospitals_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Incidents Table (Emergency Queue & Crash Kinematics)
CREATE TABLE `incidents` (
    `incident_id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `patient_id` VARCHAR(36) NOT NULL,
    `hospital_id` VARCHAR(36) NOT NULL,
    `pre_crash_speed_kmh` DECIMAL(6, 2) NOT NULL,
    `peak_g_force` DECIMAL(5, 2) NOT NULL,
    `crash_location` POINT NOT NULL,
    `status` ENUM('TRIGGERED', 'DISPATCHED', 'PREPARED', 'RESOLVED') NOT NULL DEFAULT 'TRIGGERED',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_incidents_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_incidents_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`hospital_id`) ON DELETE RESTRICT,
    SPATIAL INDEX `idx_incidents_crash_location` (`crash_location`),
    INDEX `idx_incidents_status_created` (`status`, `created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Seed Data: Diverse Patient Pool (EMR)
INSERT INTO `patients` (
    `patient_id`,
    `full_name`,
    `age`,
    `blood_group`,
    `allergies`,
    `chronic_conditions`,
    `emergency_contact`
) VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Alex Mercer',
    34,
    'O-',
    JSON_ARRAY('Penicillin', 'Sulfa Drugs'),
    JSON_ARRAY('Mild Asthma', 'Hypertension'),
    'Sarah Mercer (Spouse) +1 (555) 382-9912'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Elena Rostova',
    29,
    'A+',
    JSON_ARRAY('Latex', 'Aspirin'),
    JSON_ARRAY('None Reported'),
    'Dmitri Rostov (Brother) +1 (555) 204-8119'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Marcus Vance',
    51,
    'B+',
    JSON_ARRAY('Iodine Contrast'),
    JSON_ARRAY('Type 2 Diabetes', 'Hypertension'),
    'Elena Vance (Daughter) +1 (555) 492-3810'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Chloe Bennett',
    23,
    'AB-',
    JSON_ARRAY('Shellfish', 'Cephalosporins'),
    JSON_ARRAY('Mild Arrhythmia'),
    'Liam Bennett (Father) +1 (555) 710-4492'
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'David Miller',
    42,
    'O+',
    JSON_ARRAY('No Known Drug Allergies'),
    JSON_ARRAY('Epilepsy (Controlled)'),
    'Karen Miller (Spouse) +1 (555) 831-2901'
);

-- 5. Seed Data: Regional Trauma Centers
-- WGS 84 Coordinates: POINT(Longitude, Latitude)
INSERT INTO `hospitals` (
    `hospital_id`,
    `name`,
    `trauma_level`,
    `location`,
    `is_active`
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Metro General Trauma Center',
    '1',
    POINT(-73.9554, 40.7645),
    TRUE
),
(
    '22222222-2222-2222-2222-222222222222',
    'St. Jude Regional Acute Care',
    '2',
    POINT(-73.9875, 40.7360),
    TRUE
),
(
    '33333333-3333-3333-3333-333333333333',
    'Harborview Community Hospital',
    '3',
    POINT(-73.9980, 40.7180),
    TRUE
);

-- 6. Users Table for Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'HOSPITAL', 'PATIENT') NOT NULL,
  `patient_id` VARCHAR(36) NULL,
  `hospital_id` VARCHAR(36) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_users_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`hospital_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `users` (`user_id`, `email`, `password`, `role`, `patient_id`, `hospital_id`) VALUES
('u-admin-001', 'admin@auratriage.org', 'admin123', 'ADMIN', NULL, NULL),
('u-hosp-001', 'staff@metrogeneral.org', 'hospital123', 'HOSPITAL', NULL, '11111111-1111-1111-1111-111111111111'),
('u-hosp-002', 'staff@stjude.org', 'hospital123', 'HOSPITAL', NULL, '22222222-2222-2222-2222-222222222222'),
('u-pat-001', 'alex.mercer@gmail.com', 'patient123', 'PATIENT', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL),
('u-pat-002', 'elena.rostova@gmail.com', 'patient123', 'PATIENT', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL);


