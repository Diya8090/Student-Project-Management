using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Student_project_man.Models
{
    public class SPM_Status
    {
        [Key]
        public int StatusID { get; set; }

        [Required]
        [MaxLength(20)]
        public string StatusName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string StatusCssClass { get; set; } = string.Empty;
        // Navigation Properties
        [JsonIgnore]
        public ICollection<SPM_Project> Projects { get; set; } = new List<SPM_Project>();
        [JsonIgnore]
        public ICollection<SPM_Task> Tasks { get; set; } = new List<SPM_Task>();
    }
}
