using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JustHallAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffRoleRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "staff_role_requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    staff_id = table.Column<int>(type: "int", nullable: false),
                    requested_role = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    remarks = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    requested_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    reviewed_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    reviewed_by = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_staff_role_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_staff_role_requests_users_staff_staff_id",
                        column: x => x.staff_id,
                        principalTable: "users_staff",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_staff_role_requests_users_user_reviewed_by",
                        column: x => x.reviewed_by,
                        principalTable: "users_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_staff_role_requests_requested_at",
                table: "staff_role_requests",
                column: "requested_at");

            migrationBuilder.CreateIndex(
                name: "IX_staff_role_requests_reviewed_by",
                table: "staff_role_requests",
                column: "reviewed_by");

            migrationBuilder.CreateIndex(
                name: "IX_staff_role_requests_staff_id",
                table: "staff_role_requests",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_role_requests_status",
                table: "staff_role_requests",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "staff_role_requests");
        }
    }
}
