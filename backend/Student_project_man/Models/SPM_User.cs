using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Student_project_man.Models
{
    public class SPM_User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string ProfilePicturePath { get; set; } = string.Empty;

        [Required]
        public bool IsActive { get; set; } = true;

        public bool? IsDeleted { get; set; } = false;


        // Navigation Properties
        [JsonIgnore]
        public ICollection<SPM_UserRole> UserRoles { get; set; } = new List<SPM_UserRole>();

        [InverseProperty("Student")]
        [JsonIgnore]
        public ICollection<SPM_Project> StudentProjects { get; set; } = new List<SPM_Project>();

        [InverseProperty("Faculty")]
        [JsonIgnore]
        public ICollection<SPM_Project> FacultyProjects { get; set; } = new List<SPM_Project>();
    }
}
