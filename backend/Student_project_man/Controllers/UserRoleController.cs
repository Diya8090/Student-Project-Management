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
    [Authorize(Roles = "Admin")]
    public class UserRoleController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<AddEditUserRoleDTO> _validator;

        public UserRoleController(
            AppDbContext context,
            IValidator<AddEditUserRoleDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        // GET: api/UserRole
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetUserRoleDTO>>> GetUserRoles()
        {
            var userRoles = await _context.UserRoles
                .Include(ur => ur.Users)
                .Include(ur => ur.Roles)
                .Select(ur => new GetUserRoleDTO
                {
                    RolePermissionId = ur.RolePermissionId,
                    RoleId = ur.RoleId,
                    RoleName = ur.Roles != null
                        ? ur.Roles.RoleName
                        : null,
                    UserId = ur.UserId,
                    UserName = ur.Users != null
                        ? ur.Users.FullName
                        : null
                })
                .ToListAsync();

            return Ok(userRoles);
        }

        // GET: api/UserRole/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<GetUserRoleDTO>> GetUserRole(int id)
        {
            var userRole = await _context.UserRoles
                .Include(ur => ur.Users)
                .Include(ur => ur.Roles)
                .Where(ur => ur.RolePermissionId == id)
                .Select(ur => new GetUserRoleDTO
                {
                    RolePermissionId = ur.RolePermissionId,
                    RoleId = ur.RoleId,
                    RoleName = ur.Roles != null
                        ? ur.Roles.RoleName
                        : null,
                    UserId = ur.UserId,
                    UserName = ur.Users != null
                        ? ur.Users.FullName
                        : null
                })
                .FirstOrDefaultAsync();

            if (userRole == null)
            {
                return NotFound(new
                {
                    message =
                        $"UserRole assignment with ID {id} not found."
                });
            }

            return Ok(userRole);
        }

        // POST: api/UserRole
        [HttpPost]
        public async Task<ActionResult<GetUserRoleDTO>> PostUserRole(
            AddEditUserRoleDTO dto)
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

            var userRole = new SPM_UserRole
            {
                RoleId = dto.RoleId,
                UserId = dto.UserId
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            var roleName = await _context.Roles
                .Where(r => r.RoleId == dto.RoleId)
                .Select(r => r.RoleName)
                .FirstOrDefaultAsync();

            var userName = await _context.Users
                .Where(u => u.UserId == dto.UserId)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync();

            var resultDto = new GetUserRoleDTO
            {
                RolePermissionId = userRole.RolePermissionId,
                RoleId = userRole.RoleId,
                RoleName = roleName,
                UserId = userRole.UserId,
                UserName = userName
            };

            return CreatedAtAction(
                nameof(GetUserRole),
                new { id = userRole.RolePermissionId },
                resultDto);
        }

        // PUT: api/UserRole/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutUserRole(
            int id,
            AddEditUserRoleDTO dto)
        {
            var userRole = await _context.UserRoles.FindAsync(id);

            if (userRole == null)
            {
                return NotFound(new
                {
                    message =
                        $"UserRole assignment with ID {id} not found."
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

            userRole.RoleId = dto.RoleId;
            userRole.UserId = dto.UserId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/UserRole/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUserRole(int id)
        {
            var userRole = await _context.UserRoles.FindAsync(id);

            if (userRole == null)
            {
                return NotFound(new
                {
                    message =
                        $"UserRole assignment with ID {id} not found."
                });
            }

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}