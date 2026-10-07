using FluentValidation;
using Student_project_man.DTOs;

namespace Student_project_man.Validator
{
    public class ProjectValidator : AbstractValidator<AddEditProjectDTO>
    {
        public ProjectValidator()
        {
            RuleFor(x => x.ProjectTitle)
                .NotEmpty()
                .WithMessage("Project title is required.")
                .MaximumLength(200)
                .WithMessage("Project title cannot exceed 200 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage("Description cannot exceed 1000 characters.");

            RuleFor(x => x.StudentId)
                .GreaterThan(0)
                .WithMessage("Valid StudentId is required.");

            RuleFor(x => x.FacultyId)
                .GreaterThan(0)
                .WithMessage("Valid FacultyId is required.");

            RuleFor(x => x.ProjectStatus)
                .GreaterThan(0)
                .WithMessage("Valid project status is required.");

            RuleFor(x => x.StartDate)
                .NotEmpty()
                .WithMessage("Start date is required.");

            RuleFor(x => x.EndDate)
                .NotEmpty()
                .WithMessage("End date is required.")
                .GreaterThanOrEqualTo(x => x.StartDate)
                .WithMessage("End date must be greater than or equal to start date.");
        }
    }
}
