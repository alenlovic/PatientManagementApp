using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatientManagementApp.Migrations
{
    /// <inheritdoc />
    public partial class patientfileentity_fileoriginalname : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileOriginalName",
                table: "PatientFiles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileOriginalName",
                table: "PatientFiles");
        }
    }
}
