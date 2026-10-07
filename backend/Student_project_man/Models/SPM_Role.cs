using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Student_project_man.Models
{
    public class SPM_Role
    {
        [Key]
        public int RoleId { get; set; }

        [Required, MaxLength(50)]
        public string RoleName { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Description { get; set; }
        // Navigation Properties
        [JsonIgnore]
        public ICollection<SPM_UserRole> UserRoles { get; set; } = new List<SPM_UserRole>();
    }
}
