namespace Student_project_man.DTOs
{
    public class AddEditProjectDTO
    {
        public string ProjectTitle { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int StudentId { get; set; }
        public int FacultyId { get; set; }
        public DateTime AssignedDate { get; set; } = DateTime.Now;
        public bool? IsDeleted { get; set; } = false;
        public int ProjectStatus { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalTasks { get; set; } = 0;
        public int CompletedTasks { get; set; } = 0;
        public decimal ProgressPercentage { get; set; } = 0.00m;
    }
}
