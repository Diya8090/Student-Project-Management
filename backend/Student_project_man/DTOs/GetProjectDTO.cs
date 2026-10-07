namespace Student_project_man.DTOs
{
    public class GetProjectDTO
    {
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int StudentId { get; set; }
        public string? StudentName { get; set; }
        public int FacultyId { get; set; }
        public string? FacultyName { get; set; }
        public DateTime AssignedDate { get; set; }
        public bool? IsDeleted { get; set; }
        public int ProjectStatus { get; set; }
        public string? StatusName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public decimal ProgressPercentage { get; set; }
    }
}
