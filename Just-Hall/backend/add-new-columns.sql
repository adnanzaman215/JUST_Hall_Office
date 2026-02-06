-- Add new columns to hallcore_application table
ALTER TABLE hallcore_application
ADD COLUMN profile_photo_url VARCHAR(255) NULL AFTER payment_slip_url,
ADD COLUMN user_id VARCHAR(100) NULL AFTER profile_photo_url,
ADD COLUMN password VARCHAR(255) NULL AFTER user_id;

-- Verify the new columns were added
DESCRIBE hallcore_application;
