using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using TuneVault.Application.Common.Behaviors;
using MediatR;
using TuneVault.Application.Common.Interfaces;
namespace TuneVault.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // Tự động scan và đăng ký tất cả các IAuthorizer
            var assembly = Assembly.GetExecutingAssembly();
            var authorizerTypes = assembly.GetTypes()
                .Where(t => !t.IsAbstract && !t.IsInterface)
                .Where(t => t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IAuthorizer<>)))
                .ToList();

            foreach (var authorizerType in authorizerTypes)
 1           {
                var interfaces = authorizerType.GetInterfaces()
                    .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IAuthorizer<>));

                foreach (var i in interfaces)
                {
                    services.AddTransient(i, authorizerType);
                }
            }

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>)); // Kích hoạt trạm quét
                cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>)); // Kích hoạt trạm quét quyền
            });
            return services;
        }
    }
}