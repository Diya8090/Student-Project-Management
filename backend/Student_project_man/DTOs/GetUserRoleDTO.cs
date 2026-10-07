namespace Student_project_man.DTOs
{
    public class GetUserRoleDTO
    {
        public int RolePermissionId { get; set; }
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
    }
}
