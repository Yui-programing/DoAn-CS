using System.Data;
using Microsoft.Data.SqlClient;
using TuneVault.Application.Repositories;
using TuneVault.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Thêm Controller
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Lấy connection string
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                          ?? throw new InvalidOperationException("Không tìm thấy chuỗi kết nối 'DefaultConnection'.");

// Đăng ký SQL Connection
builder.Services.AddTransient<IDbConnection>(sp => new SqlConnection(connectionString));

// Đăng ký Repository
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Đăng ký MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(TuneVault.Application.Features.Users.Queries.GetAllUsersQuery).Assembly));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers(); // Map các Controller vào pipeline

app.Run();