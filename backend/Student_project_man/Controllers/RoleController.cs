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
    public class RoleController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<AddEditRoleDTO> _validator;

        public RoleController(
            AppDbContext context,
            IValidator<AddEditRoleDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        // GET: api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetRoleDTO>>> GetRoles()
        {
            var roles = await _context.Roles
                .Select(r => new GetRoleDTO
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description
                })
                .ToListAsync();

            return Ok(roles);
        }

        // GET: api/Role/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<GetRoleDTO>> GetRole(int id)
        {
            var role = await _context.Roles
                .Where(r => r.RoleId == id)
                .Select(r => new GetRoleDTO
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound(new
                {
                    message = $"Role with ID {id} not found."
                });
            }

            return Ok(role);
        }

        // POST: api/Role
        [HttpPost]
        public async Task<ActionResult<GetRoleDTO>> PostRole(
            AddEditRoleDTO dto)
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

            var role = new SPM_Role
            {
                RoleName = dto.RoleName,
                Description = dto.Description
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            var resultDto = new GetRoleDTO
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                Description = role.Description
            };

            return CreatedAtAction(
                nameof(GetRole),
                new { id = role.RoleId },
                resultDto);
        }

        // PUT: api/Role/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutRole(
            int id,
            AddEditRoleDTO dto)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
            {
                return NotFound(new
                {
                    message = $"Role with ID {id} not found."
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

            role.RoleName = dto.RoleName;
            role.Description = dto.Description;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Role/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
            {
                return NotFound(new
                {
                    message = $"Role with ID {id} not found."
                });
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}