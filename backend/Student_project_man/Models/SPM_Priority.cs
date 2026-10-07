using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Student_project_man.Models
{
    public class SPM_Priority
    {
        [Key]
        public int PriorityID { get; set; }

        [Required]
        [MaxLength(20)]
        public string PriorityName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PriorityCssClass { get; set; } = string.Empty;
        // Navigation Properties
        [JsonIgnore]
        public ICollection<SPM_Task> Tasks { get; set; } = new List<SPM_Task>();
    }
}
