using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using TuneVault.Application.Common.Behaviors;
using MediatR;

namespace TuneVault.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>)); // Kích hoạt trạm quét
            });

            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>)); // Đăng ký trạm quét vào hệ thống

            return services;
        }
    }
}