using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatientManagementApp.Migrations
{
    /// <inheritdoc />
    public partial class patientfileentity_patientid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PatientFiles_PatientRecords_PatientRecordId",
                table: "PatientFiles");

            migrationBuilder.DropColumn(
                name: "OPG",
                table: "PatientFiles");

            migrationBuilder.RenameColumn(
                name: "PatientRecordId",
                table: "PatientFiles",
                newName: "PatientId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientFiles_PatientRecordId",
                table: "PatientFiles",
                newName: "IX_PatientFiles_PatientId");

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "PatientFiles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_PatientFiles_Patients_PatientId",
                table: "PatientFiles",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "PatientId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PatientFiles_Patients_PatientId",
                table: "PatientFiles");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "PatientFiles");

            migrationBuilder.RenameColumn(
                name: "PatientId",
                table: "PatientFiles",
                newName: "PatientRecordId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientFiles_PatientId",
                table: "PatientFiles",
                newName: "IX_PatientFiles_PatientRecordId");

            migrationBuilder.AddColumn<byte[]>(
                name: "OPG",
                table: "PatientFiles",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientFiles_PatientRecords_PatientRecordId",
                table: "PatientFiles",
                column: "PatientRecordId",
                principalTable: "PatientRecords",
                principalColumn: "PatientRecordId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
