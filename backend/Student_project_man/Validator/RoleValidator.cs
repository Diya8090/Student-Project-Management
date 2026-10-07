using FluentValidation;
using Student_project_man.DTOs;

namespace Student_project_man.Validator
{
    public class RoleValidator : AbstractValidator<AddEditRoleDTO>
    {
        public RoleValidator()
        {
            RuleFor(x => x.RoleName)
                .NotEmpty()
                .WithMessage("Role name is required.")
                .MaximumLength(50)
                .WithMessage("Role name cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(250)
                .WithMessage("Description cannot exceed 250 characters.");
        }
    }
}
