using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatientManagementApp.Migrations
{
    /// <inheritdoc />
    public partial class billingeditcost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "serviceCost",
                table: "Billing",
                newName: "ServiceCost");

            migrationBuilder.RenameColumn(
                name: "payedAmount",
                table: "Billing",
                newName: "PayedAmount");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ServiceCost",
                table: "Billing",
                newName: "serviceCost");

            migrationBuilder.RenameColumn(
                name: "PayedAmount",
                table: "Billing",
                newName: "payedAmount");
        }
    }
}
