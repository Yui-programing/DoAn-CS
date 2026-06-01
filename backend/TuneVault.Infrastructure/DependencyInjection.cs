using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TuneVault.Application.Repositories;
using TuneVault.Infrastructure.Repositories;

namespace TuneVault.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Lấy connection string
            string connectionString = configuration.GetConnectionString("DefaultConnection")
                                      ?? throw new InvalidOperationException("Không tìm thấy chuỗi kết nối 'DefaultConnection'.");

            // Đăng ký SQL Connection
            services.AddTransient<IDbConnection>(sp => new SqlConnection(connectionString));

            // Đăng ký Repository
            services.AddScoped<IUserRepository, UserRepository>();

            return services;
        }
    }
}