using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JustHallAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffTypeAndStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "staff_type",
                table: "users_staff",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "users_staff",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "staff_type",
                table: "users_staff");

            migrationBuilder.DropColumn(
                name: "status",
                table: "users_staff");
        }
    }
}
