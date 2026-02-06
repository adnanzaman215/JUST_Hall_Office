-- Add Staff and Admin tables to JustHall Database

USE justhall;

-- Create users_staff table
CREATE TABLE IF NOT EXISTS users_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(100) DEFAULT '',
    department VARCHAR(100) DEFAULT '',
    joining_date DATE NULL,
    dob DATE NULL,
    gender VARCHAR(10) DEFAULT '',
    blood_group VARCHAR(5) DEFAULT '',
    mobile_number VARCHAR(20) DEFAULT '',
    emergency_number VARCHAR(20) DEFAULT '',
    address TEXT,
    qualification VARCHAR(255) DEFAULT '',
    photo_url VARCHAR(100) NULL,
    FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users_admin table
CREATE TABLE IF NOT EXISTS users_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(100) DEFAULT '',
    department VARCHAR(100) DEFAULT '',
    joining_date DATE NULL,
    dob DATE NULL,
    gender VARCHAR(10) DEFAULT '',
    mobile_number VARCHAR(20) DEFAULT '',
    address TEXT,
    photo_url VARCHAR(100) NULL,
    FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
