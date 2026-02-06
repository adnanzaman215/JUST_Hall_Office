-- Add missing columns to hallcore_application table

ALTER TABLE hallcore_application
ADD COLUMN father_name VARCHAR(150) AFTER address,
ADD COLUMN mother_name VARCHAR(150) AFTER father_name,
ADD COLUMN father_occupation VARCHAR(100) AFTER mother_name,
ADD COLUMN mother_occupation VARCHAR(100) AFTER father_occupation,
ADD COLUMN household_income DECIMAL(10, 2) AFTER mother_occupation,
ADD COLUMN payment_slip_url VARCHAR(255) AFTER payment_slip_no,
ADD COLUMN profile_photo_url VARCHAR(255) AFTER payment_slip_url,
ADD COLUMN user_id VARCHAR(100) AFTER profile_photo_url,
ADD COLUMN password VARCHAR(255) AFTER user_id,
ADD COLUMN viva_date DATETIME AFTER status,
ADD COLUMN viva_serial_no INT AFTER viva_date;

-- Verify the structure
DESCRIBE hallcore_application;
