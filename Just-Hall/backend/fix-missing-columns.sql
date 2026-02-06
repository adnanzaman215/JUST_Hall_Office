-- Remove the incomplete migration record
DELETE FROM __EFMigrationsHistory WHERE MigrationId = '20260206090354_AddUserIdAndPasswordToApplication';

-- Add profile_photo_url if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'justhall'
    AND TABLE_NAME = 'hallcore_application'
    AND COLUMN_NAME = 'profile_photo_url'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE hallcore_application ADD COLUMN profile_photo_url VARCHAR(255) NULL AFTER payment_slip_url',
    'SELECT "profile_photo_url already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add user_id if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'justhall'
    AND TABLE_NAME = 'hallcore_application'
    AND COLUMN_NAME = 'user_id'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE hallcore_application ADD COLUMN user_id VARCHAR(100) NULL AFTER profile_photo_url',
    'SELECT "user_id already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add password if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'justhall'
    AND TABLE_NAME = 'hallcore_application'
    AND COLUMN_NAME = 'password'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE hallcore_application ADD COLUMN password VARCHAR(255) NULL AFTER user_id',
    'SELECT "password already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show the table structure
DESCRIBE hallcore_application;
