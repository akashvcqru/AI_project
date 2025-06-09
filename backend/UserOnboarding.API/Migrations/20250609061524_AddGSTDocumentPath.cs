using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserOnboarding.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGSTDocumentPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PANNumber",
                table: "EKYC");

            migrationBuilder.AddColumn<string>(
                name: "GSTDocumentPath",
                table: "EKYC",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GSTDocumentPath",
                table: "EKYC");

            migrationBuilder.AddColumn<string>(
                name: "PANNumber",
                table: "EKYC",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");
        }
    }
}
