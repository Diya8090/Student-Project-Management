using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_project_man.Common;
using Student_project_man.Data;
using Student_project_man.DTOs;
using Student_project_man.Models;

namespace Student_project_man.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<AddEditTaskDTO> _validator;

        public TaskController(
            AppDbContext context,
            IValidator<AddEditTaskDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        // ============================================
        // GET ALL TASKS
        // Admin + Faculty + Student
        // ============================================
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<IEnumerable<GetTaskDTO>>> GetTasks()
        {
            var tasks = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Select(t => new GetTaskDTO
                {
                    TaskId = t.TaskId,
                    AllocationID = t.AllocationID,

                    ProjectTitle = t.Project != null
                        ? t.Project.ProjectTitle
                        : null,

                    TaskTitle = t.TaskTitle,
                    TaskDescription = t.TaskDescription,

                    TaskStatus = t.TaskStatus,

                    StatusName = t.Status != null
                        ? t.Status.StatusName
                        : null,

                    PriorityID = t.PriorityID,

                    PriorityName = t.Priority != null
                        ? t.Priority.PriorityName
                        : null,

                    AssignedScore = t.AssignedScore,
                    EarnedScore = t.EarnedScore,
                    ProgressPercentage = t.ProgressPercentage,
                    StartDate = t.StartDate,
                    DueDate = t.DueDate,
                    CompletedDate = t.CompletedDate,
                    FacultyRemarks = t.FacultyRemarks,
                    StudentRemarks = t.StudentRemarks,
                    IsDeleted = t.IsDeleted
                })
                .ToListAsync();

            return Ok(new ApiResponse<IEnumerable<GetTaskDTO>>
            {
                Success = true,
                Message = "Project tasks retrieved successfully.",
                Data = tasks
            });
        }

        // ============================================
        // GET TASK BY ID
        // Admin + Faculty + Student
        // ============================================
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<GetTaskDTO>> GetTask(int id)
        {
            var task = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.TaskId == id)
                .Select(t => new GetTaskDTO
                {
                    TaskId = t.TaskId,
                    AllocationID = t.AllocationID,

                    ProjectTitle = t.Project != null
                        ? t.Project.ProjectTitle
                        : null,

                    TaskTitle = t.TaskTitle,
                    TaskDescription = t.TaskDescription,
                    TaskStatus = t.TaskStatus,

                    StatusName = t.Status != null
                        ? t.Status.StatusName
                        : null,

                    PriorityID = t.PriorityID,

                    PriorityName = t.Priority != null
                        ? t.Priority.PriorityName
                        : null,

                    AssignedScore = t.AssignedScore,
                    EarnedScore = t.EarnedScore,
                    ProgressPercentage = t.ProgressPercentage,
                    StartDate = t.StartDate,
                    DueDate = t.DueDate,
                    CompletedDate = t.CompletedDate,
                    FacultyRemarks = t.FacultyRemarks,
                    StudentRemarks = t.StudentRemarks,
                    IsDeleted = t.IsDeleted
                })
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return NotFound(new ApiResponse<GetTaskDTO>
                {
                    Success = false,
                    Message = "Project task not found.",
                    Data = null,
                    Errors = new List<string>
                    {
                        $"No project task exists with ID {id}."
                    }
                });
            }

            return Ok(new ApiResponse<GetTaskDTO>
            {
                Success = true,
                Message = "Project task retrieved successfully.",
                Data = task
            });
        }

        // ============================================
        // CREATE TASK
        // Admin + Faculty
        // ============================================
        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<ActionResult<GetTaskDTO>> PostTask(
            AddEditTaskDTO dto)
        {
            var result = await _validator.ValidateAsync(dto);

            if (!result.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = result.Errors
                        .Select(x => x.ErrorMessage)
                        .ToList()
                });
            }

            var task = new SPM_Task
            {
                AllocationID = dto.AllocationID,
                TaskTitle = dto.TaskTitle,
                TaskDescription = dto.TaskDescription,
                TaskStatus = dto.TaskStatus,
                PriorityID = dto.PriorityID,
                AssignedScore = dto.AssignedScore,
                EarnedScore = dto.EarnedScore,
                ProgressPercentage = dto.ProgressPercentage,
                StartDate = dto.StartDate,
                DueDate = dto.DueDate,
                CompletedDate = dto.CompletedDate,
                FacultyRemarks = dto.FacultyRemarks,
                StudentRemarks = dto.StudentRemarks,
                IsDeleted = dto.IsDeleted ?? false
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            await RecalculateProjectProgressAsync(
                task.AllocationID);

            var projectTitle = await _context.Projects
                .Where(p => p.ProjectId == dto.AllocationID)
                .Select(p => p.ProjectTitle)
                .FirstOrDefaultAsync();

            var statusName = await _context.Statuses
                .Where(s => s.StatusID == dto.TaskStatus)
                .Select(s => s.StatusName)
                .FirstOrDefaultAsync();

            var priorityName = await _context.Priorities
                .Where(pr => pr.PriorityID == dto.PriorityID)
                .Select(pr => pr.PriorityName)
                .FirstOrDefaultAsync();

            var resultDto = new GetTaskDTO
            {
                TaskId = task.TaskId,
                AllocationID = task.AllocationID,
                ProjectTitle = projectTitle,
                TaskTitle = task.TaskTitle,
                TaskDescription = task.TaskDescription,
                TaskStatus = task.TaskStatus,
                StatusName = statusName,
                PriorityID = task.PriorityID,
                PriorityName = priorityName,
                AssignedScore = task.AssignedScore,
                EarnedScore = task.EarnedScore,
                ProgressPercentage = task.ProgressPercentage,
                StartDate = task.StartDate,
                DueDate = task.DueDate,
                CompletedDate = task.CompletedDate,
                FacultyRemarks = task.FacultyRemarks,
                StudentRemarks = task.StudentRemarks,
                IsDeleted = task.IsDeleted
            };

            return CreatedAtAction(
                nameof(GetTask),
                new { id = task.TaskId },
                resultDto);
        }

        // ============================================
        // UPDATE TASK
        // Admin + Faculty
        // ============================================
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> PutTask(
            int id,
            AddEditTaskDTO dto)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return NotFound(new ApiResponse<GetTaskDTO>
                {
                    Success = false,
                    Message = "Project task not found.",
                    Errors = new List<string>
                    {
                        $"No project task exists with ID {id}."
                    }
                });
            }

            var result = await _validator.ValidateAsync(dto);

            if (!result.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = result.Errors
                        .Select(x => x.ErrorMessage)
                        .ToList()
                });
            }

            int oldProjectId = task.AllocationID;

            task.AllocationID = dto.AllocationID;
            task.TaskTitle = dto.TaskTitle;
            task.TaskDescription = dto.TaskDescription;
            task.TaskStatus = dto.TaskStatus;
            task.PriorityID = dto.PriorityID;
            task.AssignedScore = dto.AssignedScore;
            task.EarnedScore = dto.EarnedScore;
            task.ProgressPercentage = dto.ProgressPercentage;
            task.StartDate = dto.StartDate;
            task.DueDate = dto.DueDate;
            task.CompletedDate = dto.CompletedDate;
            task.FacultyRemarks = dto.FacultyRemarks;
            task.StudentRemarks = dto.StudentRemarks;

            if (dto.IsDeleted.HasValue)
            {
                task.IsDeleted = dto.IsDeleted.Value;
            }

            await _context.SaveChangesAsync();

            await RecalculateProjectProgressAsync(
                task.AllocationID);

            if (oldProjectId != task.AllocationID)
            {
                await RecalculateProjectProgressAsync(
                    oldProjectId);
            }

            return NoContent();
        }

        // ============================================
        // DELETE TASK
        // Admin + Faculty
        // ============================================
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return NotFound(new
                {
                    message = $"Task with ID {id} not found."
                });
            }

            int projectId = task.AllocationID;

            _context.Tasks.Remove(task);

            await _context.SaveChangesAsync();

            await RecalculateProjectProgressAsync(projectId);

            return NoContent();
        }

        // ============================================
        // RECALCULATE PROJECT PROGRESS
        // ============================================
        private async Task RecalculateProjectProgressAsync(
            int projectId)
        {
            var project = await _context.Projects.FindAsync(projectId);

            if (project == null)
                return;

            var projectTasks = await _context.Tasks
                .Where(t =>
                    t.AllocationID == projectId &&
                    t.IsDeleted != true)
                .ToListAsync();

            project.TotalTasks = projectTasks.Count;

            project.CompletedTasks =
                projectTasks.Count(
                    t => t.ProgressPercentage >= 100);

            project.ProgressPercentage =
                project.TotalTasks > 0
                    ? Math.Round(
                        projectTasks
                            .Average(t => t.ProgressPercentage), 2)
                    : 0.00m;

            await _context.SaveChangesAsync();
        }
    }
}