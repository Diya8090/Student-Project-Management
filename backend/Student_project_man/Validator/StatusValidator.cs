using FluentValidation;
using Student_project_man.DTOs;

namespace Student_project_man.Validator
{
    public class StatusValidator : AbstractValidator<AddEditStatusDTO>
    {
        public StatusValidator()
        {
            RuleFor(x => x.StatusName)
                .NotEmpty()
                .WithMessage("Status name is required.")
                .MaximumLength(20)
                .WithMessage("Status name cannot exceed 20 characters.");

            RuleFor(x => x.StatusCssClass)
                .NotEmpty()
                .WithMessage("Status CSS class is required.")
                .MaximumLength(100)
                .WithMessage("Status CSS class cannot exceed 100 characters.");
        }
    }
}
