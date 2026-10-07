namespace Student_project_man.DTOs
{
    public class GetTaskDTO
    {
        public int TaskId { get; set; }
        public int AllocationID { get; set; }
        public string? ProjectTitle { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public string? TaskDescription { get; set; }
        public int TaskStatus { get; set; }
        public string? StatusName { get; set; }
        public int PriorityID { get; set; }
        public string? PriorityName { get; set; }
        public decimal AssignedScore { get; set; }
        public decimal? EarnedScore { get; set; }
        public decimal ProgressPercentage { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? FacultyRemarks { get; set; }
        public string? StudentRemarks { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
