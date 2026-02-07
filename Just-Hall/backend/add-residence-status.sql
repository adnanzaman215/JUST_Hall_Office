-- Add residence_status column to users_student table
ALTER TABLE users_student 
ADD COLUMN residence_status VARCHAR(20) DEFAULT 'non-resident' AFTER session;

-- Update existing students to non-resident
UPDATE users_student 
SET residence_status = 'non-resident' 
WHERE residence_status IS NULL;

-- Make room_no VARCHAR(20) to support seat designations like "230B1"
ALTER TABLE users_student 
MODIFY COLUMN room_no VARCHAR(20) NULL;

-- Clear any old numeric values
UPDATE users_student 
SET room_no = NULL 
WHERE room_no = '0' OR room_no = '';

-- Show the updated structure
DESCRIBE users_student;
