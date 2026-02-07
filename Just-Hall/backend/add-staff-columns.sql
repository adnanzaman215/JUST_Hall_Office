-- Add new columns to users_staff table
ALTER TABLE `users_staff` 
ADD COLUMN `staff_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' AFTER `employee_id`;

ALTER TABLE `users_staff`
ADD COLUMN `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Active' AFTER `department`;

-- Show the updated structure
DESCRIBE `users_staff`;
