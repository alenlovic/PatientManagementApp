using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatientManagementApp.Migrations
{
    /// <inheritdoc />
    public partial class addedCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Note",
                table: "Patients",
                newName: "PatientNote");

            migrationBuilder.RenameColumn(
                name: "Note",
                table: "PatientRecords",
                newName: "RecordNote");

            migrationBuilder.RenameColumn(
                name: "Appointment",
                table: "PatientAppointmentEntity",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Patients",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PatientRecords",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "AppointmentDate",
                table: "PatientAppointmentEntity",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Billing",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PatientRecords");

            migrationBuilder.DropColumn(
                name: "AppointmentDate",
                table: "PatientAppointmentEntity");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Billing");

            migrationBuilder.RenameColumn(
                name: "PatientNote",
                table: "Patients",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "RecordNote",
                table: "PatientRecords",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PatientAppointmentEntity",
                newName: "Appointment");
        }
    }
}
