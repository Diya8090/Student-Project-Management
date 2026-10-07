using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_project_man.Data;

namespace Student_project_man.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        //1) Display the total number of students registered in the system.

        #region Student Count

        [HttpGet("StudentCount")]
        public async Task<ActionResult<int>> GetStudentCount()
        {
            var totalStudents = await _context.Users
                    .CountAsync(u => u.UserRoles.Any(ur => ur.Roles.RoleName == "Student"));

            return Ok(new
            {
                TotalStudents = totalStudents
            });
        }
        #endregion

        //2) Display the total number of faculty members guiding projects.
        #region FacultyCount
        [HttpGet("FacultyCount")]
        public async Task<IActionResult> GetFacultyCount()
        {
            var totalFaculty = await _context.Projects
                          .Select(p => p.FacultyId)
                          .Distinct()
                          .CountAsync();

            return Ok(new
            {
                TotalFaculty = totalFaculty
            });
        }
        #endregion

        //3)Display the total number of projects available in the system.

        #region Project Count

        [HttpGet("ProjectCount")]
        public async Task<ActionResult> GetProjectCount()
        {
            var totalProjects = await _context.Projects.CountAsync();

            return Ok(new
            {
                TotalProjects = totalProjects
            });
        }
        #endregion

        //4) Show how many tasks belong to each status category.
        #region ProjectCount
        [HttpGet("TasksByStatus")]
        public async Task<IActionResult> GetTasksByStatus()
        {
            var result = await _context.Tasks
                .GroupBy(t => t.TaskStatus)
                .Select(g => new
                {
                    StatusId = g.Key,
                    Tasks = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }
        #endregion

        //5)Show priority wise task count
        #region TasksByPriority
        [HttpGet("TasksByPriority")]
        public async Task<IActionResult> GetTasksByPriority()
        {
            var result = await _context.Tasks
         .Include(t => t.Priority)
         .GroupBy(t => new
         {
             t.PriorityID,
             t.Priority.PriorityName
         })
         .Select(g => new
         {
             Priority = g.Key.PriorityName,
             Tasks = g.Count()
         })
         .ToListAsync();

            return Ok(result);
        }
        #endregion

        //6)Show how many projects are assigned to each faculty member.
        #region  FacultyProjectCount
        [HttpGet("ProjectsByFaculty")]
        public async Task<IActionResult> GetProjectsByFaculty()
        {
            var result = await _context.Projects
                .Include(p => p.Faculty)
                .GroupBy(p => new
                {
                    p.FacultyId,
                    p.Faculty.FullName
                })
                .Select(g => new
                {
                    Faculty = g.Key.FullName,
                    Projects = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }
        #endregion

        // 7) Show how many tasks have been assigned to each student.

        #region StudentTaskCount

        [HttpGet("TasksByStudent")]
        public async Task<IActionResult> GetTasksByStudent()
        {
            var result = await _context.Tasks
                .Include(t => t.Project)
                .ThenInclude(p => p.Student)
                .GroupBy(t => new
                {
                    t.Project.StudentId,
                    t.Project.Student.FullName
                })
                .Select(g => new
                {
                    Student = g.Key.FullName,
                    Tasks = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 8) Display the top 10 students having the highest average earned score.

        #region Top10Students

        [HttpGet("Top10Students")]
        public async Task<IActionResult> GetTop10Students()
        {
            var result = await _context.Tasks
                .Include(t => t.Project)
                .ThenInclude(p => p.Student)
                .Where(t => t.EarnedScore.HasValue)
                .GroupBy(t => new
                {
                    t.Project.StudentId,
                    t.Project.Student.FullName
                })
                .Select(g => new
                {
                    Student = g.Key.FullName,
                    AvgScore = g.Average(t => t.EarnedScore)
                })
                .OrderByDescending(x => x.AvgScore)
                .Take(10)
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 9) Display the bottom 10 students based on average earned score.

        #region Bottom10Students

        [HttpGet("Bottom10Students")]
        public async Task<IActionResult> GetBottom10Students()
        {
            var result = await _context.Tasks
                .Include(t => t.Project)
                .ThenInclude(p => p.Student)
                .Where(t => t.EarnedScore.HasValue)
                .GroupBy(t => new
                {
                    t.Project.StudentId,
                    t.Project.Student.FullName
                })
                .Select(g => new
                {
                    Student = g.Key.FullName,
                    TotalTasks = g.Count(),
                    AvgScore = g.Average(t => t.EarnedScore)
                })
                .OrderBy(x => x.AvgScore)
                .Take(10)
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 10) Display all tasks whose due date has passed but are not completed.

        #region OverdueTasks

        [HttpGet("OverdueTasks")]
        public async Task<IActionResult> GetOverdueTasks()
        {
            var result = await _context.Tasks
                .Include(t => t.Project)
                .ThenInclude(p => p.Student)
                .Include(t => t.Project)
                .ThenInclude(p => p.Faculty)
                .Include(t => t.Status)
                .Where(t =>
                    t.DueDate.HasValue &&
                    t.DueDate.Value < DateTime.Today &&
                    t.Status.StatusName != "Completed")
                .Select(t => new
                {
                    TaskId = t.TaskId,
                    TaskTitle = t.TaskTitle,
                    Student = t.Project.Student.FullName,
                    Faculty = t.Project.Faculty.FullName,
                    DueDate = t.DueDate,
                    DaysOverdue = EF.Functions.DateDiffDay(
                        t.DueDate.Value,
                        DateTime.Today)
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        //11) Display tasks having follow-up dates within the next 7 days.

        #region UpcomingFollowUpTasks
        [HttpGet("UpcomingFollowUpTasks")]
        public async Task<IActionResult> GetUpcomingFollowUpTasks()
        {
            return Ok(new
            {
                Message = "Follow-up date is not available in the current ProjectTask model."
            });
        }
        #endregion

        // 12) Show how many students have obtained each grade.

        //#region StudentsByGrade

        //[HttpGet("StudentsByGrade")]
        //public async Task<IActionResult> GetStudentsByGrade()
        //{
        //    var result = await _context.Users
        //        .Where(u => u.Grade != null)
        //        .GroupBy(u => u.Grade)
        //        .Select(g => new
        //        {
        //            Grade = g.Key,
        //            Students = g.Count()
        //        })
        //        .ToListAsync();

        //    return Ok(result);
        //}

        //#endregion

        // 13) Show month-wise completed task count.

        #region MonthlyCompletedTasks

        [HttpGet("MonthlyCompletedTasks")]
        public async Task<IActionResult> GetMonthlyCompletedTasks()
        {
            var result = await _context.Tasks
                .Where(t => t.CompletedDate.HasValue)
                .GroupBy(t => new
                {
                    Year = t.CompletedDate.Value.Year,
                    Month = t.CompletedDate.Value.Month
                })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    CompletedTasks = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 14) Display Role Wise Active User Count.

        #region ActiveUsersByRole

        [HttpGet("ActiveUsersByRole")]
        public async Task<IActionResult> GetActiveUsersByRole()
        {
            var result = await _context.UserRoles
                .Include(ur => ur.Roles)
                .Include(ur => ur.Users)
                .Where(ur => ur.Users.IsActive && ur.Users.IsDeleted != true)
                .GroupBy(ur => new
                {
                    ur.RoleId,
                    ur.Roles.RoleName
                })
                .Select(g => new
                {
                    Role = g.Key.RoleName,
                    ActiveUsers = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 15) Display each role with users assigned to it.

        #region RoleWiseUsers

        [HttpGet("RoleWiseUsers")]
        public async Task<IActionResult> GetRoleWiseUsers()
        {
            var result = await _context.UserRoles
                .Include(ur => ur.Roles)
                .Include(ur => ur.Users)
                .Select(ur => new
                {
                    Role = ur.Roles.RoleName,
                    UserName = ur.Users.FullName
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 16) List Roles Having More Than 10 Users.

        #region RolesMoreThan10Users

        [HttpGet("RolesMoreThan10Users")]
        public async Task<IActionResult> GetRolesMoreThan10Users()
        {
            var result = await _context.UserRoles
                .Include(ur => ur.Roles)
                .GroupBy(ur => new
                {
                    ur.RoleId,
                    ur.Roles.RoleName
                })
                .Where(g => g.Count() > 10)
                .Select(g => new
                {
                    Role = g.Key.RoleName,
                    TotalUsers = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 17) Display role statistics.

        #region RoleStatistics

        [HttpGet("RoleStatistics")]
        public async Task<IActionResult> GetRoleStatistics()
        {
            var result = await _context.UserRoles
                .Include(ur => ur.Roles)
                .Include(ur => ur.Users)
                .GroupBy(ur => new
                {
                    ur.RoleId,
                    ur.Roles.RoleName
                })
                .Select(g => new
                {
                    Role = g.Key.RoleName,
                    TotalUsers = g.Count(),
                    ActiveUsers = g.Count(x =>
                        x.Users.IsActive &&
                        x.Users.IsDeleted != true),
                    InactiveUsers = g.Count(x =>
                        !x.Users.IsActive ||
                        x.Users.IsDeleted == true)
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 18) Show tasks due within next 7 days.

        #region TasksDueNext7Days

        [HttpGet("TasksDueNext7Days")]
        public async Task<IActionResult> GetTasksDueNext7Days()
        {
            var today = DateTime.Today;
            var next7Days = today.AddDays(7);

            var result = await _context.Tasks
                .Include(t => t.Project)
                .ThenInclude(p => p.Student)
                .Where(t =>
                    t.DueDate.HasValue &&
                    t.DueDate.Value >= today &&
                    t.DueDate.Value <= next7Days)
                .Select(t => new
                {
                    TaskId = t.TaskId,
                    TaskTitle = t.TaskTitle,
                    Project = t.Project.ProjectTitle,
                    Student = t.Project.Student.FullName,
                    DueDate = t.DueDate,
                    DaysRemaining = EF.Functions.DateDiffDay(
                        today,
                        t.DueDate.Value)
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 19) Display each project with total tasks, completed tasks,
        // pending tasks, and average task progress.

        #region ProjectTaskStatistics

        [HttpGet("ProjectTaskStatistics")]
        public async Task<IActionResult> GetProjectTaskStatistics()
        {
            var result = await _context.Projects
                .Include(p => p.Tasks)
                .ThenInclude(t => t.Status)
                .Select(p => new
                {
                    Project = p.ProjectTitle,

                    Tasks = p.Tasks.Count(),

                    Completed = p.Tasks.Count(t =>
                        t.Status.StatusName == "Completed"),

                    Pending = p.Tasks.Count(t =>
                        t.Status.StatusName != "Completed"),

                    AvgProgress = p.Tasks.Any()
                        ? p.Tasks.Average(t => t.ProgressPercentage)
                        : 0
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 20) Display project-wise total assigned score, earned score, and score percentage.

        #region ProjectScoreStatistics

        [HttpGet("ProjectScoreStatistics")]
        public async Task<IActionResult> GetProjectScoreStatistics()
        {
            var result = await _context.Projects
                .Include(p => p.Tasks)
                .Select(p => new
                {
                    Project = p.ProjectTitle,

                    TotalAssignedScore = p.Tasks
                        .Sum(t => t.AssignedScore),

                    TotalEarnedScore = p.Tasks
                        .Where(t => t.EarnedScore.HasValue)
                        .Sum(t => t.EarnedScore ?? 0),

                    ScorePercentage =
                        p.Tasks.Sum(t => t.AssignedScore) > 0
                            ? (
                                p.Tasks
                                    .Where(t => t.EarnedScore.HasValue)
                                    .Sum(t => t.EarnedScore ?? 0)
                                /
                                p.Tasks.Sum(t => t.AssignedScore)
                              ) * 100
                            : 0
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion


        // 21) Display Top 10 projects based on average earned score.

        #region Top10Projects

        [HttpGet("Top10Projects")]
        public async Task<IActionResult> GetTop10Projects()
        {
            var result = await _context.Projects
                .Include(p => p.Tasks)
                .Select(p => new
                {
                    Project = p.ProjectTitle,

                    AverageScore = p.Tasks
                        .Where(t => t.EarnedScore.HasValue)
                        .Average(t => (decimal?)t.EarnedScore) ?? 0
                })
                .OrderByDescending(x => x.AverageScore)
                .Take(10)
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 22) Show project count, task count, and average progress for each faculty.

        #region FacultyStatistics

        [HttpGet("FacultyStatistics")]
        public async Task<IActionResult> GetFacultyStatistics()
        {
            var result = await _context.Projects
                .Include(p => p.Faculty)
                .Include(p => p.Tasks)
                .GroupBy(p => new
                {
                    p.FacultyId,
                    p.Faculty.FullName
                })
                .Select(g => new
                {
                    Faculty = g.Key.FullName,

                    TotalProjects = g.Count(),

                    TotalTasks = g.Sum(p => p.Tasks.Count()),

                    AvgProgress = g.Average(p => p.ProgressPercentage)
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 23) Display task completion statistics and average score for each student.

        #region StudentTaskStatistics

        [HttpGet("StudentTaskStatistics")]
        public async Task<IActionResult> GetStudentTaskStatistics()
        {
            var result = await _context.Tasks
                .Include(t => t.Project)
                .ThenInclude(p => p.Student)
                .Include(t => t.Status)
                .GroupBy(t => new
                {
                    t.Project.StudentId,
                    t.Project.Student.FullName
                })
                .Select(g => new
                {
                    Student = g.Key.FullName,

                    TotalTasks = g.Count(),

                    CompletedTasks = g.Count(t =>
                        t.Status.StatusName == "Completed"),

                    PendingTasks = g.Count(t =>
                        t.Status.StatusName != "Completed"),

                    AvgScore = g.Where(t => t.EarnedScore.HasValue)
                                .Average(t => (decimal?)t.EarnedScore) ?? 0
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 24) Display projects whose expected completion date has passed but are still incomplete.

        #region OverdueProjects

        [HttpGet("OverdueProjects")]
        public async Task<IActionResult> GetOverdueProjects()
        {
            var result = await _context.Projects
                .Include(p => p.Student)
                .Include(p => p.Faculty)
                .Where(p =>
                    p.EndDate < DateTime.Today &&
                    p.ProgressPercentage < 100)
                .Select(p => new
                {
                    Project = p.ProjectTitle,
                    Student = p.Student.FullName,
                    Faculty = p.Faculty.FullName,
                    EndDate = p.EndDate,
                    Progress = p.ProgressPercentage
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 25) Show month-wise completed task count.

        #region MonthlyCompletedTaskCount

        [HttpGet("MonthlyCompletedTaskCount")]
        public async Task<IActionResult> GetMonthlyCompletedTaskCount()
        {
            var result = await _context.Tasks
                .Where(t =>
                    t.CompletedDate.HasValue &&
                    t.Status.StatusName == "Completed")
                .GroupBy(t => new
                {
                    Year = t.CompletedDate.Value.Year,
                    Month = t.CompletedDate.Value.Month
                })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    CompletedTasks = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return Ok(result);
        }

        #endregion

        // 26) Rank faculties based on average project progress.

        #region FacultyRanking

        [HttpGet("FacultyRanking")]
        public async Task<IActionResult> GetFacultyRanking()
        {
            var result = await _context.Projects
                .Include(p => p.Faculty)
                .GroupBy(p => new
                {
                    p.FacultyId,
                    p.Faculty.FullName
                })
                .Select(g => new
                {
                    Faculty = g.Key.FullName,
                    AvgProgress = g.Average(p => p.ProgressPercentage)
                })
                .OrderByDescending(x => x.AvgProgress)
                .ToListAsync();

            var rankedResult = result
                .Select((x, index) => new
                {
                    Rank = index + 1,
                    x.Faculty,
                    x.AvgProgress
                })
                .ToList();

            return Ok(rankedResult);
        }

        #endregion

        // 27) Display task statistics for every project.

        #region ProjectTaskStats

        [HttpGet("ProjectTaskStats")]
        public async Task<IActionResult> GetProjectTaskStats()
        {
            var today = DateTime.Today;

            var result = await _context.Projects
                .Include(p => p.Tasks)
                .ThenInclude(t => t.Status)
                .Select(p => new
                {
                    Project = p.ProjectTitle,

                    TotalTasks = p.Tasks.Count(),

                    Completed = p.Tasks.Count(t =>
                        t.Status.StatusName == "Completed"),

                    Pending = p.Tasks.Count(t =>
                        t.Status.StatusName != "Completed"),

                    Overdue = p.Tasks.Count(t =>
                        t.DueDate.HasValue &&
                        t.DueDate.Value < today &&
                        t.Status.StatusName != "Completed")
                })
                .ToListAsync();

            return Ok(result);
        }

        #endregion
    }
}

