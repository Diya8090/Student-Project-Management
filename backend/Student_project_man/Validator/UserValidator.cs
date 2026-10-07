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
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters.");

        RuleFor(x => x.MobileNumber)
            .NotEmpty()
            .WithMessage("Mobile number is required.")
            .Matches(@"^[0-9]{10,15}$")
            .WithMessage("Mobile number must contain 10 to 15 digits.");

        RuleFor(x => x.ProfilePicturePath)
            .NotEmpty()
            .WithMessage("Profile picture path is required.")
            .MaximumLength(500)
            .WithMessage("Profile picture path cannot exceed 500 characters.");

        RuleFor(x => x.IsActive)
            .NotNull()
            .WithMessage("IsActive is required.");

    }
}