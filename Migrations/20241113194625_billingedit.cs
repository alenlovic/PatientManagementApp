using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatientManagementApp.Migrations
{
    /// <inheritdoc />
    public partial class billingedit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CurrentAmount",
                table: "Billing",
                newName: "serviceCost");

            migrationBuilder.AddColumn<int>(
                name: "payedAmount",
                table: "Billing",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "payedAmount",
                table: "Billing");

            migrationBuilder.RenameColumn(
                name: "serviceCost",
                table: "Billing",
                newName: "CurrentAmount");
        }
    }
}
