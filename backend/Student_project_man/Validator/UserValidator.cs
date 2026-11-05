using FluentValidation;
using Student_project_man.DTOs;

public class UserValidator : AbstractValidator<AddEditUserDTO>
{
    public UserValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .WithMessage("Full name is required.")
            .MaximumLength(150)
            .WithMessage("Full name cannot exceed 150 characters.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Enter a valid email address.")
            .MaximumLength(150)
            .WithMessage("Email cannot exceed 150 characters.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required.")
            .MinimumLength(4)
            .WithMessage("Password must be at least 4 characters.");

        RuleFor(x => x.MobileNumber)
            .NotEmpty()
            .WithMessage("Mobile number is required.")
            .Matches(@"^[0-9\+\-\s\(\)]{7,20}$")
            .WithMessage("Mobile number must be a valid phone number.");

        RuleFor(x => x.ProfilePicturePath)
            .MaximumLength(500)
            .WithMessage("Profile picture path cannot exceed 500 characters.");

        RuleFor(x => x.IsActive)
            .NotNull()
            .WithMessage("IsActive is required.");

    }
}