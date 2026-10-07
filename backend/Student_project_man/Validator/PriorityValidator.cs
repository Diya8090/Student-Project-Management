using FluentValidation;
using Student_project_man.DTOs;

namespace Student_project_man.Validator
{
    public class PriorityValidator : AbstractValidator<AddEditPriorityDTO>
    {
        public PriorityValidator()
        {
            RuleFor(x => x.PriorityName)
                .NotEmpty()
                .WithMessage("Priority name is required.")
                .MaximumLength(20)
                .WithMessage("Priority name cannot exceed 20 characters.");

            RuleFor(x => x.PriorityCssClass)
                .NotEmpty()
                .WithMessage("Priority CSS class is required.")
                .MaximumLength(20)
                .WithMessage("Priority CSS class cannot exceed 20 characters.");
        }
    }
}
