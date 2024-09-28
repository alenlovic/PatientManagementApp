using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatientManagementApp.Migrations
{
    /// <inheritdoc />
    public partial class beze : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OPG",
                table: "PatientRecords");

            migrationBuilder.CreateTable(
                name: "PatientFiles",
                columns: table => new
                {
                    PatientFileId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientRecordId = table.Column<int>(type: "int", nullable: false),
                    OPG = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientFiles", x => x.PatientFileId);
                    table.ForeignKey(
                        name: "FK_PatientFiles_PatientRecords_PatientRecordId",
                        column: x => x.PatientRecordId,
                        principalTable: "PatientRecords",
                        principalColumn: "PatientRecordId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PatientFiles_PatientRecordId",
                table: "PatientFiles",
                column: "PatientRecordId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientFiles");

            migrationBuilder.AddColumn<byte[]>(
                name: "OPG",
                table: "PatientRecords",
                type: "varbinary(max)",
                nullable: true);
        }
    }
}
