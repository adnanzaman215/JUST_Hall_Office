-- Add room_no column to hallcore_application table for room allocation
ALTER TABLE hallcore_application 
ADD COLUMN room_no VARCHAR(20) NULL AFTER viva_serial_no;
