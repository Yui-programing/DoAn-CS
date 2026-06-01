using TuneVault.Application;
using TuneVault.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Thêm Controller
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// GỌI GOM CẤU HÌNH CỦA CÁC TẦNG DƯỚI TẠI ĐÂY
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Lưới hứng lỗi tự động
app.UseMiddleware<TuneVault.API.Middlewares.ExceptionHandlingMiddleware>();

app.MapControllers();

app.Run();