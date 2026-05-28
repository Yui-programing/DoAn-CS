using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TuneVault.Application.Behaviors;
using TuneVault.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CẤU HÌNH DATABASE (Từ Chặng 1)
// ==========================================
builder.Services.AddDbContext<TuneVaultDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ==========================================
// 2. CẤU HÌNH MEDIATR VÀ VALIDATION (Từ Chặng 2)
// ==========================================
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(TuneVault.Application.UseCases.Auth.LoginCommand).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});
builder.Services.AddValidatorsFromAssembly(typeof(TuneVault.Application.UseCases.Auth.LoginCommandValidator).Assembly);

// ==========================================
// 3. CẤU HÌNH AUTHENTICATION & JWT (Từ Chặng 2)
// ==========================================
var jwtSecret = builder.Configuration["JwtSettings:Secret"]
                ?? throw new InvalidOperationException("Không tìm thấy JwtSettings:Secret trong file cấu hình!");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// ==========================================
// 4. CẤU HÌNH CONTROLLERS
// ==========================================
builder.Services.AddControllers();

// --- THÊM VÀO PHẦN ĐĂNG KÝ SERVICE ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



var app = builder.Build();

// --- THÊM VÀO PHẦN MIDDLEWARE CỦA APP ---
// Bỏ qua lệnh if(app.Environment.IsDevelopment()) để luôn bật Swagger trong Docker
app.UseSwagger();
app.UseSwaggerUI();

// Các lệnh app.Use... khác của bạn (nếu có)

// ==========================================
// 5. CẤU HÌNH MIDDLEWARE PIPELINE
// ==========================================
app.UseHttpsRedirection();

app.UseAuthentication(); // Bắt buộc chạy TRƯỚC Authorization
app.UseAuthorization();

app.MapControllers();

app.Run();