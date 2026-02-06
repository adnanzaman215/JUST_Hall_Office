-- Delete the application with empty student_id
DELETE FROM hallcore_application WHERE student_id = '' OR student_id IS NULL;

-- Verify it's deleted
SELECT COUNT(*) as remaining_records FROM hallcore_application;

-- Show any remaining records
SELECT id, student_id, full_name, email, created_at FROM hallcore_application;
