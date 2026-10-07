using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_project_man.Models
{
    public class SPM_Task
    {
        [Key]
        public int TaskId { get; set; }

        [Required]
        public int AllocationID { get; set; }

        [Required]
        [MaxLength(200)]
        public string TaskTitle { get; set; } = string.Empty;

        public string? TaskDescription { get; set; }

        [Required]
        public int TaskStatus { get; set; }

        [Required]
        public int PriorityID { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal AssignedScore { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? EarnedScore { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; } = 0.00m;

        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }

        [MaxLength(500)]
        public string? FacultyRemarks { get; set; }

        [MaxLength(500)]
        public string? StudentRemarks { get; set; }

        public bool? IsDeleted { get; set; } = false;

        // Foreign Key Navigation Properties
        [ForeignKey(nameof(AllocationID))]
        public SPM_Project Project { get; set; } = null!;

        [ForeignKey(nameof(TaskStatus))]
        public SPM_Status Status { get; set; } = null!;

        [ForeignKey(nameof(PriorityID))]
        public SPM_Priority Priority { get; set; } = null!;
    }
}
