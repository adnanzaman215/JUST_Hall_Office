-- JustHall Database Setup Script for MySQL
-- Run this script to create the database and tables

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS justhall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE justhall;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS users_student;
DROP TABLE IF EXISTS hallcore_application;
DROP TABLE IF EXISTS notices_notice;
DROP TABLE IF EXISTS users_user;

-- Create users_user table
CREATE TABLE users_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT '',
    role VARCHAR(10) DEFAULT 'student',
    student_id VARCHAR(50) DEFAULT '',
    department VARCHAR(100) DEFAULT '',
    is_verified TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    is_staff TINYINT(1) DEFAULT 0,
    is_superuser TINYINT(1) DEFAULT 0,
    date_joined DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users_student table
CREATE TABLE users_student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    session VARCHAR(100) DEFAULT '',
    room_no INT DEFAULT 0,
    dob DATE NULL,
    gender VARCHAR(10) DEFAULT '',
    blood_group VARCHAR(5) DEFAULT '',
    father_name VARCHAR(255) DEFAULT '',
    mother_name VARCHAR(255) DEFAULT '',
    mobile_number VARCHAR(20) DEFAULT '',
    emergency_number VARCHAR(20) DEFAULT '',
    address TEXT,
    photo_url VARCHAR(100) NULL,
    FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create hallcore_application table
CREATE TABLE hallcore_application (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    session VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    payment_slip_no VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_payment_slip (payment_slip_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notices_notice table
CREATE TABLE notices_notice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(32) DEFAULT 'General',
    author VARCHAR(120) DEFAULT 'Admin',
    pinned TINYINT(1) DEFAULT 0,
    attachment_url VARCHAR(255) NULL,
    expires_on DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pinned (pinned),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample admin user
-- Password: Admin123! (BCrypt hash)
INSERT INTO users_user (username, email, password, full_name, role, is_verified, is_active, is_staff, is_superuser, date_joined) 
VALUES (
    'admin@justhall.com',
    'admin@justhall.com',
    '$2a$11$5QhZZZmDxqJKM7xqzZVHH.vYmJZCvLWmVkHZY8Y7jZhMxZZZZZZZu',
    'System Administrator',
    'admin',
    1,
    1,
    1,
    1,
    NOW()
);

-- Insert sample notices
INSERT INTO notices_notice (title, body, category, author, pinned, created_at, updated_at) VALUES
('Welcome to JustHall Management System', 'This is the official notice board for hall management. Stay updated with all announcements here.', 'General', 'Admin', 1, NOW(), NOW()),
('Hall Seat Application Open', 'Applications for new hall seats are now open. Please submit your application through the system.', 'General', 'Admin', 1, NOW(), NOW()),
('Maintenance Notice', 'Scheduled maintenance will be performed on December 15th. Water supply may be affected.', 'Maintenance', 'Admin', 0, NOW(), NOW());

-- Verify table creation
SELECT 'Tables created successfully!' AS status;

-- Show table structures
SHOW TABLES;

-- Show record counts
SELECT 'users_user' AS table_name, COUNT(*) AS record_count FROM users_user
UNION ALL
SELECT 'users_student', COUNT(*) FROM users_student
UNION ALL
SELECT 'hallcore_application', COUNT(*) FROM hallcore_application
UNION ALL
SELECT 'notices_notice', COUNT(*) FROM notices_notice;
