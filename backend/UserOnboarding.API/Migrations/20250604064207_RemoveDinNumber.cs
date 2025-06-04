using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserOnboarding.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDinNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DinNumber",
                table: "OnboardingEntries");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DinNumber",
                table: "OnboardingEntries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
