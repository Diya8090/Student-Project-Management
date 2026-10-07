using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Student_project_man.Migrations
{
    /// <inheritdoc />
    public partial class fk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Roles_SPM_RoleRoleId",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Users_SPM_UserUserId",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_SPM_RoleRoleId",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_SPM_UserUserId",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "SPM_RoleRoleId",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "SPM_UserUserId",
                table: "UserRoles");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Roles_RoleId",
                table: "UserRoles",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "RoleId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Users_UserId",
                table: "UserRoles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Roles_RoleId",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Users_UserId",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_UserId",
                table: "UserRoles");

            migrationBuilder.AddColumn<int>(
                name: "SPM_RoleRoleId",
                table: "UserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SPM_UserUserId",
                table: "UserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_SPM_RoleRoleId",
                table: "UserRoles",
                column: "SPM_RoleRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_SPM_UserUserId",
                table: "UserRoles",
                column: "SPM_UserUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Roles_SPM_RoleRoleId",
                table: "UserRoles",
                column: "SPM_RoleRoleId",
                principalTable: "Roles",
                principalColumn: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Users_SPM_UserUserId",
                table: "UserRoles",
                column: "SPM_UserUserId",
                principalTable: "Users",
                principalColumn: "UserId");
        }
    }
}
