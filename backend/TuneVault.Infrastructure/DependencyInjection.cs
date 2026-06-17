using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TuneVault.Application.Repositories;
using TuneVault.Infrastructure.Repositories;
using TuneVault.Infrastructure.Configurations;
using TuneVault.Infrastructure.Services;

namespace TuneVault.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Lấy connection string
            string connectionString = configuration.GetConnectionString("DefaultConnection")
                                      ?? throw new InvalidOperationException("Không tìm thấy chuỗi kết nối 'DefaultConnection'.");
            // Bind config từ appsettings.json
            services.Configure<CloudinarySettings>(configuration.GetSection("CloudinarySettings"));

            // Đăng ký SQL Connection
            services.AddTransient<IDbConnection>(sp => new SqlConnection(connectionString));

            // Đăng ký Repository
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPlaylistRepository, PlaylistRepository>();
            services.AddScoped<IMediaItemRepository, MediaItemRepository>();
            services.AddScoped<IArtistRegistrationRepository, ArtistRegistrationRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IPlayHistoryRepository, PlayHistoryRepository>();
            services.AddScoped<ISharedRepository, SharedMediaRepository>();
            services.AddScoped<ISearchRepository, SearchRepository>();
            services.AddScoped<IFavoriteRepository, FavoriteRepository>();
            services.AddScoped<IOtpRepository, OtpRepository>();
            services.AddScoped<ICloudinaryService, CloudinaryService>();
            services.AddScoped<TuneVault.Application.Common.Interfaces.IEmailService, EmailService>();
            services.AddScoped<TuneVault.Application.Common.Interfaces.INotificationService, NotificationService>();

            return services;
        }
    }
}