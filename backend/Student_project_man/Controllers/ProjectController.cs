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
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<AddEditProjectDTO> _validator;

        public ProjectController(
            AppDbContext context,
            IValidator<AddEditProjectDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        // Admin + Faculty + Student
        // GET: api/Project
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<IEnumerable<GetProjectDTO>>> GetProjects()
        {
            var projects = await _context.Projects
                .Include(p => p.Student)
                .Include(p => p.Faculty)
                .Include(p => p.Status)
                .Select(p => new GetProjectDTO
                {
                    ProjectId = p.ProjectId,
                    ProjectTitle = p.ProjectTitle,
                    Description = p.Description,

                    StudentId = p.StudentId,
                    StudentName = p.Student != null
                        ? p.Student.FullName
                        : null,

                    FacultyId = p.FacultyId,
                    FacultyName = p.Faculty != null
                        ? p.Faculty.FullName
                        : null,

                    AssignedDate = p.AssignedDate,
                    IsDeleted = p.IsDeleted,
                    ProjectStatus = p.ProjectStatus,

                    StatusName = p.Status != null
                        ? p.Status.StatusName
                        : null,

                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    TotalTasks = p.TotalTasks,
                    CompletedTasks = p.CompletedTasks,
                    ProgressPercentage = p.ProgressPercentage
                })
                .ToListAsync();

            return Ok(projects);
        }

        // Admin + Faculty + Student
        // GET: api/Project/5
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<ActionResult<GetProjectDTO>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Student)
                .Include(p => p.Faculty)
                .Include(p => p.Status)
                .Where(p => p.ProjectId == id)
                .Select(p => new GetProjectDTO
                {
                    ProjectId = p.ProjectId,
                    ProjectTitle = p.ProjectTitle,
                    Description = p.Description,

                    StudentId = p.StudentId,
                    StudentName = p.Student != null
                        ? p.Student.FullName
                        : null,

                    FacultyId = p.FacultyId,
                    FacultyName = p.Faculty != null
                        ? p.Faculty.FullName
                        : null,

                    AssignedDate = p.AssignedDate,
                    IsDeleted = p.IsDeleted,
                    ProjectStatus = p.ProjectStatus,

                    StatusName = p.Status != null
                        ? p.Status.StatusName
                        : null,

                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    TotalTasks = p.TotalTasks,
                    CompletedTasks = p.CompletedTasks,
                    ProgressPercentage = p.ProgressPercentage
                })
                .FirstOrDefaultAsync();

            if (project == null)
            {
                return NotFound(new
                {
                    message = $"Project with ID {id} not found."
                });
            }

            return Ok(project);
        }

        // Admin + Faculty
        // POST: api/Project
        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<ActionResult<GetProjectDTO>> PostProject(
            AddEditProjectDTO dto)
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

            var project = new SPM_Project
            {
                ProjectTitle = dto.ProjectTitle,
                Description = dto.Description,
                StudentId = dto.StudentId,
                FacultyId = dto.FacultyId,
                AssignedDate = dto.AssignedDate,
                IsDeleted = dto.IsDeleted ?? false,
                ProjectStatus = dto.ProjectStatus,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TotalTasks = dto.TotalTasks,
                CompletedTasks = dto.CompletedTasks,
                ProgressPercentage = dto.ProgressPercentage
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var studentName = await _context.Users
                .Where(u => u.UserId == dto.StudentId)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync();

            var facultyName = await _context.Users
                .Where(u => u.UserId == dto.FacultyId)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync();

            var statusName = await _context.Statuses
                .Where(s => s.StatusID == dto.ProjectStatus)
                .Select(s => s.StatusName)
                .FirstOrDefaultAsync();

            var resultDto = new GetProjectDTO
            {
                ProjectId = project.ProjectId,
                ProjectTitle = project.ProjectTitle,
                Description = project.Description,

                StudentId = project.StudentId,
                StudentName = studentName,

                FacultyId = project.FacultyId,
                FacultyName = facultyName,

                AssignedDate = project.AssignedDate,
                IsDeleted = project.IsDeleted,
                ProjectStatus = project.ProjectStatus,
                StatusName = statusName,

                StartDate = project.StartDate,
                EndDate = project.EndDate,
                TotalTasks = project.TotalTasks,
                CompletedTasks = project.CompletedTasks,
                ProgressPercentage = project.ProgressPercentage
            };

            return CreatedAtAction(
                nameof(GetProject),
                new { id = project.ProjectId },
                resultDto);
        }

        // Admin + Faculty
        // PUT: api/Project/5
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> PutProject(
            int id,
            AddEditProjectDTO dto)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound(new
                {
                    message = $"Project with ID {id} not found."
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

            project.ProjectTitle = dto.ProjectTitle;
            project.Description = dto.Description;
            project.StudentId = dto.StudentId;
            project.FacultyId = dto.FacultyId;
            project.AssignedDate = dto.AssignedDate;

            if (dto.IsDeleted.HasValue)
            {
                project.IsDeleted = dto.IsDeleted.Value;
            }

            project.ProjectStatus = dto.ProjectStatus;
            project.StartDate = dto.StartDate;
            project.EndDate = dto.EndDate;
            project.TotalTasks = dto.TotalTasks;
            project.CompletedTasks = dto.CompletedTasks;
            project.ProgressPercentage = dto.ProgressPercentage;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Admin + Faculty
        // DELETE: api/Project/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound(new
                {
                    message = $"Project with ID {id} not found."
                });
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}