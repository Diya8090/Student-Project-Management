using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_project_man.Models
{
    public class SPM_UserRole
    {
        [Key]
        public int RolePermissionId { get; set; }

        [Required]
        public int RoleId { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public SPM_User? Users { get; set; }

        [ForeignKey("RoleId")]
        public SPM_Role? Roles { get; set; }
    }
}
