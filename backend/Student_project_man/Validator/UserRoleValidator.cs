using FluentValidation;
using Student_project_man.DTOs;

namespace Student_project_man.Validator
{
    public class UserRoleValidator : AbstractValidator<AddEditUserRoleDTO>
    {
        public UserRoleValidator()
        {
            RuleFor(x => x.RoleId)
                .GreaterThan(0)
                .WithMessage("Valid RoleId is required.");

            RuleFor(x => x.UserId)
                .GreaterThan(0)
                .WithMessage("Valid UserId is required.");
        }
    }
}
