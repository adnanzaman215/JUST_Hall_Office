-- Add residence_status column to users_student table
ALTER TABLE users_student 
ADD COLUMN residence_status VARCHAR(20) DEFAULT 'non-resident' AFTER session;

-- Update existing students to non-resident
UPDATE users_student 
SET residence_status = 'non-resident' 
WHERE residence_status IS NULL;

-- Make room_no nullable and set to NULL for non-residents
ALTER TABLE users_student 
MODIFY COLUMN room_no INT NULL;

-- Update existing students with room_no = 0 to NULL
UPDATE users_student 
SET room_no = NULL 
WHERE room_no = 0;

-- Show the updated structure
DESCRIBE users_student;
