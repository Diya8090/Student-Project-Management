using FluentValidation;
using Student_project_man.DTOs;

namespace Student_project_man.Validator
{
    public class TaskValidator : AbstractValidator<AddEditTaskDTO>
    {
        public TaskValidator()
        {
            RuleFor(x => x.AllocationID)
                .GreaterThan(0)
                .WithMessage("Valid AllocationID is required.");

            RuleFor(x => x.TaskTitle)
                .NotEmpty()
                .WithMessage("Task title is required.")
                .MaximumLength(200)
                .WithMessage("Task title cannot exceed 200 characters.");

            RuleFor(x => x.TaskDescription)
                .MaximumLength(1000)
                .WithMessage("Task description cannot exceed 1000 characters.");

            RuleFor(x => x.TaskStatus)
                .GreaterThan(0)
                .WithMessage("Valid task status is required.");

            RuleFor(x => x.PriorityID)
                .GreaterThan(0)
                .WithMessage("Valid PriorityID is required.");

            RuleFor(x => x.AssignedScore)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Assigned score cannot be negative.")
                .LessThanOrEqualTo(100)
                .WithMessage("Assigned score cannot exceed 100.");

            RuleFor(x => x.EarnedScore)
                .GreaterThanOrEqualTo(0)
                .When(x => x.EarnedScore.HasValue)
                .WithMessage("Earned score cannot be negative.");

            RuleFor(x => x.EarnedScore)
                .LessThanOrEqualTo(x => x.AssignedScore)
                .When(x => x.EarnedScore.HasValue)
                .WithMessage("Earned score cannot exceed assigned score.");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0, 100)
                .WithMessage("Progress percentage must be between 0 and 100.");

            RuleFor(x => x.StartDate)
                .LessThanOrEqualTo(x => x.DueDate)
                .When(x => x.StartDate.HasValue && x.DueDate.HasValue)
                .WithMessage("Start date must be before or equal to due date.");

            RuleFor(x => x.CompletedDate)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .When(x => x.CompletedDate.HasValue && x.StartDate.HasValue)
                .WithMessage("Completed date must be greater than or equal to start date.");

            RuleFor(x => x.FacultyRemarks)
                .MaximumLength(500)
                .WithMessage("Faculty remarks cannot exceed 500 characters.");

            RuleFor(x => x.StudentRemarks)
                .MaximumLength(500)
                .WithMessage("Student remarks cannot exceed 500 characters.");
        }
    }
}
