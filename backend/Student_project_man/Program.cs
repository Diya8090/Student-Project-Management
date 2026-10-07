using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using Student_project_man.Data;
using Student_project_man.Services;
using Student_project_man.Validator;
using System.Text;

namespace Student_project_man
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            // builder.Services.AddControllers();
            ///////////////////////////////////////////////////////////////////////////////////////////////////
            builder.Services
              .AddControllers(options =>
          {
              options.ModelValidatorProviders.Clear();
          });


            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });


            /////////////////////////////Fluent Validation 
            builder.Services.AddValidatorsFromAssemblyContaining<UserValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<UserRoleValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<StatusValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<TaskValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<RoleValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<ProjectValidator>();
            builder.Services.AddValidatorsFromAssemblyContaining<PriorityValidator>();


            builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                builder.Configuration.GetConnectionString("DefaultConnection")));

            ///////////////////////////////////////////////////////////////////////////////
            //Authentication & Authorization

            builder.Services.AddScoped<TokenService>();
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
               {
                   options.TokenValidationParameters = new TokenValidationParameters
                   {
                       // Rules the app uses to check if a token is valid
                       ValidateIssuer = true,
                       ValidateAudience = true,
                       ValidateLifetime = true,
                       ValidateIssuerSigningKey = true, //confirms the token was signed with our secret key, not a fake one.

                       ValidIssuer = builder.Configuration["Jwt:Issuer"],
                       ValidAudience = builder.Configuration["Jwt:Audience"],
                       IssuerSigningKey = new SymmetricSecurityKey(
              Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
          )
                   };
               });

            // Add the Token in Scalar Not Mandatory (if Not Added the Check in Postman)
            builder.Services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, context, cancellationToken) =>
                {
                    document.Components ??= new();
                    document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
                    document.Components.SecuritySchemes.Add("Bearer", new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header,
                        Description = "Enter your JWT token here (no need to type 'Bearer' prefix)"
                    });
                    return Task.CompletedTask;
                });
            });


            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference("/");
            }

            app.UseCors("AllowAll");

            app.UseHttpsRedirection();

            app.MapControllers();

            app.Run();
        }
    }
}
