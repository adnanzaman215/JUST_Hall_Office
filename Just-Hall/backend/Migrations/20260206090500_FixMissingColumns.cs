using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JustHallAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixMissingColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove the incorrect migration record
            migrationBuilder.Sql("DELETE FROM __EFMigrationsHistory WHERE MigrationId = '20260206090354_AddUserIdAndPasswordToApplication';");
            
            // Add profile_photo_url if it doesn't exist
            migrationBuilder.Sql(@"
                SET @column_exists = (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'justhall'
                    AND TABLE_NAME = 'hallcore_application'
                    AND COLUMN_NAME = 'profile_photo_url'
                );
                
                SET @sql = IF(@column_exists = 0, 
                    'ALTER TABLE hallcore_application ADD COLUMN profile_photo_url VARCHAR(255) NULL',
                    'SELECT 1');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");
            
            // Add user_id if it doesn't exist
            migrationBuilder.Sql(@"
                SET @column_exists = (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'justhall'
                    AND TABLE_NAME = 'hallcore_application'
                    AND COLUMN_NAME = 'user_id'
                );
                
                SET @sql = IF(@column_exists = 0, 
                    'ALTER TABLE hallcore_application ADD COLUMN user_id VARCHAR(100) NULL',
                    'SELECT 1');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");
            
            // Add password if it doesn't exist
            migrationBuilder.Sql(@"
                SET @column_exists = (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'justhall'
                    AND TABLE_NAME = 'hallcore_application'
                    AND COLUMN_NAME = 'password'
                );
                
                SET @sql = IF(@column_exists = 0, 
                    'ALTER TABLE hallcore_application ADD COLUMN password VARCHAR(255) NULL',
                    'SELECT 1');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE hallcore_application DROP COLUMN IF EXISTS profile_photo_url;");
            migrationBuilder.Sql("ALTER TABLE hallcore_application DROP COLUMN IF EXISTS user_id;");
            migrationBuilder.Sql("ALTER TABLE hallcore_application DROP COLUMN IF EXISTS password;");
        }
    }
}
