namespace Student_project_man.DTOs
{
    public class GetUserDTO
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string ProfilePicturePath { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int RoleId { get; set; }
        public string? Role { get; set; }
    }
}
