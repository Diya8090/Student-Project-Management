using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_project_man.Common;
using Student_project_man.Data;
using Student_project_man.DTOs;
using Student_project_man.Models;
using Student_project_man.Services;

namespace Student_project_man.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<AddEditUserDTO> _validator;
        private readonly TokenService _tokenService;

        public UserController(
            AppDbContext context,
            IValidator<AddEditUserDTO> validator,
            TokenService tokenService)
        {
            _context = context;
            _validator = validator;
            _tokenService = tokenService;
        }

        // POST: api/User/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO dto)
        {
            try
            {
                var emailClean = (dto.Email ?? "").Trim().ToLower();
                var user = await _context.Users
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Roles)
                    .SingleOrDefaultAsync(u =>
                        u.Email.ToLower() == emailClean &&
                        u.Password == dto.Password);

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid Email or password" });
                }

                // Get user's role
                var roleName = user.UserRoles
                    .Select(ur => ur.Roles.RoleName)
                    .FirstOrDefault();

                var roleId = user.UserRoles
                    .Select(ur => ur.RoleId)
                    .FirstOrDefault();

                if (string.IsNullOrEmpty(roleName))
                {
                    return Unauthorized(new { message = "User role not found" });
                }

                // Generate JWT token
                var token = _tokenService.GenerateToken(user, roleName);

                var avatar = !string.IsNullOrWhiteSpace(user.ProfilePicturePath)
                    ? user.ProfilePicturePath
                    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        UserId = user.UserId,
                        FullName = user.FullName,
                        Email = user.Email,
                        Role = roleName,
                        RoleId = roleId,
                        MobileNumber = user.MobileNumber,
                        ProfilePicturePath = avatar,
                        IsActive = user.IsActive
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Something went wrong: " + ex.Message });
            }
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult> GetUsers(
            int pageNumber = 1,
            int pageSize = 1000,
            string? search = null,
            bool? isActive = null,
            int? roleId = null)
        {
            // Validate pagination
            if (pageNumber < 1)
            {
                pageNumber = 1;
            }

            if (pageSize < 1)
            {
                pageSize = 1000;
            }

            // Maximum page size
            if (pageSize > 1000)
            {
                pageSize = 1000;
            }

            // Base query
            var query = _context.Users
                .AsQueryable();

            // Search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(u =>
                    u.FullName.Contains(search) ||
                    u.Email.Contains(search) ||
                    u.MobileNumber.Contains(search));
            }

            // Active / inactive filter
            if (isActive.HasValue)
            {
                query = query.Where(u =>
                    u.IsActive == isActive.Value);
            }

            // Role filter
            if (roleId.HasValue)
            {
                query = query.Where(u =>
                    u.UserRoles.Any(ur =>
                        ur.RoleId == roleId.Value));
            }

            // Total records before pagination
            var totalRecords = await query.CountAsync();

            // Get users
            var users = await query
                .OrderBy(u => u.UserId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new GetUserDTO
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    MobileNumber = u.MobileNumber,
                    ProfilePicturePath = u.ProfilePicturePath,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted,

                    RoleId = u.UserRoles
                        .Select(ur => ur.RoleId)
                        .FirstOrDefault(),

                    Role = u.UserRoles
                        .Select(ur => ur.Roles.RoleName)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var totalPages =
                (int)Math.Ceiling(totalRecords / (double)pageSize);

            return Ok(new
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalRecords = totalRecords,
                TotalPages = totalPages,
                Data = users
            });
        }

        // GET: api/User/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<GetUserDTO>> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .Select(u => new GetUserDTO
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    MobileNumber = u.MobileNumber,
                    ProfilePicturePath = u.ProfilePicturePath,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted,

                    RoleId = u.UserRoles
                        .Select(ur => ur.RoleId)
                        .FirstOrDefault(),

                    Role = u.UserRoles
                        .Select(ur => ur.Roles.RoleName)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<GetUserDTO>> PostUser(
            AddEditUserDTO dto)
        {
            var result = await _validator.ValidateAsync(dto);

            if (!result.IsValid)
            {
                return BadRequest(new ApiResponse<Object>
                {
                    Success = false,
                    Message = "Validation Failed",
                    Data = null,
                    Errors = result.Errors
                        .Select(x => x.ErrorMessage)
                        .ToList()
                });
            }

            var defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
            var user = new SPM_User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                MobileNumber = dto.MobileNumber,
                ProfilePicturePath =
                    !string.IsNullOrWhiteSpace(dto.ProfilePicturePath) ? dto.ProfilePicturePath : defaultAvatar,
                IsActive = dto.IsActive,
                IsDeleted = dto.IsDeleted ?? false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userRole = new SPM_UserRole
            {
                UserId = user.UserId,
                RoleId = dto.RoleId
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            var roleName = await _context.Roles
                .Where(r => r.RoleId == dto.RoleId)
                .Select(r => r.RoleName)
                .FirstOrDefaultAsync();

            var result1 = new GetUserDTO
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                MobileNumber = user.MobileNumber,
                ProfilePicturePath = user.ProfilePicturePath,
                IsActive = user.IsActive,
                IsDeleted = user.IsDeleted,
                RoleId = dto.RoleId,
                Role = roleName
            };

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.UserId },
                result1);
        }

        // PUT: api/User/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutUser(
            int id,
            AddEditUserDTO dto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.MobileNumber = dto.MobileNumber;
            if (!string.IsNullOrWhiteSpace(dto.ProfilePicturePath))
            {
                user.ProfilePicturePath = dto.ProfilePicturePath;
            }
            user.IsActive = dto.IsActive;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.Password = dto.Password;
            }

            if (dto.RoleId > 0)
            {
                var userRole = await _context.UserRoles
                    .FirstOrDefaultAsync(x => x.UserId == id);

                if (userRole != null)
                {
                    userRole.RoleId = dto.RoleId;
                }
                else
                {
                    _context.UserRoles.Add(new SPM_UserRole
                    {
                        UserId = id,
                        RoleId = dto.RoleId
                    });
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/User/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var hasProjects = await _context.Projects.AnyAsync(p => p.StudentId == id || p.FacultyId == id);
            if (hasProjects)
            {
                user.IsDeleted = true;
                user.IsActive = false;
                await _context.SaveChangesAsync();
                return NoContent();
            }

            var userRoles = await _context.UserRoles
                .Where(x => x.UserId == id)
                .ToListAsync();

            if (userRoles.Any())
            {
                _context.UserRoles.RemoveRange(userRoles);
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}