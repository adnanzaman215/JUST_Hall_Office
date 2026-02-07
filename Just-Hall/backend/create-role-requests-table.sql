-- Create staff_role_requests table
CREATE TABLE IF NOT EXISTS staff_role_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    requested_role VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    remarks TEXT NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    review_remarks TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_staff_id (staff_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at),
    
    FOREIGN KEY (staff_id) REFERENCES users_staff(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users_user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
