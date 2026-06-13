using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TuneVault.Application;
using TuneVault.Infrastructure;
using TuneVault.Infrastructure.Hubs;


using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// Thêm Controller
builder.Services.AddControllers();
// SignalR for real-time notifications
builder.Services.AddSignalR();

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };

    // Cấu hình đọc token từ Cookie HOẶC Query String (cho SignalR)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // 1. Dành cho SignalR (Gửi token qua query string 'access_token')
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notifications"))
            {
                context.Token = accessToken;
                return Task.CompletedTask;
            }

            // 2. Dành cho API thường (Đọc từ Cookie)
            if (context.Request.Cookies.TryGetValue("token", out var token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        }
    };
});

// GỌI GOM CẤU HÌNH CỦA CÁC TẦNG DƯỚI TẠI ĐÂY
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();

// ✅ ĐƯA CẤU HÌNH CORS LÊN ĐÂY (TRƯỚC khi gọi builder.Build)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Cổng 3000 của Frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

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

// ✅ KÍCH HOẠT CORS TẠI ĐÂY (Sau UseRouting và Trước UseAuthentication)
app.UseCors("AllowFrontend");

app.UseAuthentication(); // Quẹt thẻ kiểm tra danh tính
app.UseAuthorization();  // Quét quyền hạn

app.MapControllers();
// Map SignalR hubs
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
