-- Fix room_no column type mismatch in users_student table
-- This changes room_no from INT to VARCHAR(20) to support seat designations like "230B1"

USE justhall;

-- Change room_no from INT to VARCHAR(20) to store seat designations
ALTER TABLE users_student 
MODIFY COLUMN room_no VARCHAR(20) NULL;

-- Show the updated structure
DESCRIBE users_student;

-- Verify the change
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'justhall' 
  AND TABLE_NAME = 'users_student' 
  AND COLUMN_NAME = 'room_no';
