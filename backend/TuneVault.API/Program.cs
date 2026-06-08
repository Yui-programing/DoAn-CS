using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TuneVault.Application;
using TuneVault.Infrastructure;


using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// Thêm Controller
builder.Services.AddControllers();

// Cấu hình Endpoints cho Swagger
builder.Services.AddEndpointsApiExplorer();

// --- 1. CẤU HÌNH SWAGGER CÓ Ổ KHÓA DÁN TOKEN ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TuneVault API", Version = "v1" });

    // Tạo nút Authorize
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Dán Token vào đây theo cú pháp: Bearer {token_của_bạn}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Ép Swagger phải đính kèm Token vào mỗi Request
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
                Scheme = "oauth2", Name = "Bearer", In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// --- 2. CẤU HÌNH ĐỌC VÀ GIẢI MÃ JWT TOKEN ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];


// Setting Up JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        // These values should match exactly how you GENERATED the token during Login
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// GỌI GOM CẤU HÌNH CỦA CÁC TẦNG DƯỚI TẠI ĐÂY
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();

var app = builder.Build();

// --- BẮT ĐẦU LUỒNG PIPELINE (THỨ TỰ CỰC KỲ QUAN TRỌNG) ---

// 1. Đưa lưới hứng lỗi lên đầu tiên để tóm mọi Exception
app.UseMiddleware<TuneVault.API.Middlewares.ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Tạm thời tắt chuyển hướng HTTPS khi chạy local
// app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication(); // Quẹt thẻ kiểm tra danh tính
app.UseAuthorization();  // Quét quyền hạn

app.MapControllers();

app.Run();