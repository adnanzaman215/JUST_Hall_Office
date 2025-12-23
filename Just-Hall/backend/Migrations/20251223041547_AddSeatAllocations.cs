using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JustHallAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSeatAllocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "seat_allocations",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    floor_number = table.Column<int>(type: "int", nullable: false),
                    room_number = table.Column<int>(type: "int", nullable: false),
                    seat_number = table.Column<int>(type: "int", nullable: false),
                    application_id = table.Column<int>(type: "int", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_seat_allocations", x => x.id);
                    table.ForeignKey(
                        name: "FK_seat_allocations_hallcore_application_application_id",
                        column: x => x.application_id,
                        principalTable: "hallcore_application",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_seat_allocations_application_id",
                table: "seat_allocations",
                column: "application_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "seat_allocations");
        }
    }
}
