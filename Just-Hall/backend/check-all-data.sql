-- Check all tables in the database
SHOW TABLES;

-- Check the structure of the Application table
DESCRIBE hallcore_application;

-- Check ALL records in the application table
SELECT * FROM hallcore_application;

-- Count total records
SELECT COUNT(*) as total_records FROM hallcore_application;

-- Check if there are any applications at all
SELECT id, student_id, full_name, email, created_at 
FROM hallcore_application 
ORDER BY created_at DESC;
