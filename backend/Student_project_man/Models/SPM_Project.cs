using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Student_project_man.Models
{
    public class SPM_Project
    {
        [Key]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProjectTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public int FacultyId { get; set; }

        [Required]
        public DateTime AssignedDate { get; set; } = DateTime.Now;

        public bool? IsDeleted { get; set; } = false;

        [Required]
        public int ProjectStatus { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int TotalTasks { get; set; } = 0;

        [Required]
        public int CompletedTasks { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; } = 0.00m;

        // Foreign Key Navigation Properties
        [ForeignKey(nameof(StudentId))]
        [InverseProperty("StudentProjects")]
        public SPM_User Student { get; set; } = null!;

        [ForeignKey(nameof(FacultyId))]
        [InverseProperty("FacultyProjects")]
        public SPM_User Faculty { get; set; } = null!;

        [ForeignKey(nameof(ProjectStatus))]
        public SPM_Status Status { get; set; } = null!;
        // Navigation Properties
        [JsonIgnore]
        public ICollection<SPM_Task> Tasks { get; set; } = new List<SPM_Task>();
    }
}
