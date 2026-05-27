using MediatR;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TuneVault.Application.UseCases.Auth
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, string>
    {
        public Task<string> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // 1. Giả lập kiểm tra DB (Bạn sẽ thay bằng truy vấn EF Core sau)
            if (request.Email != "admin@tunevault.com" || request.Password != "123456")
            {
                throw new UnauthorizedAccessException("Sai thông tin đăng nhập!");
            }

            // 2. Tạo JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("day-la-chuoi-bi-mat-rat-dai-cua-tune-vault-2026"); // Khớp với cấu hình appsettings.json

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, "user-phuc-1"), // ID của user seed ở chặng 1
                    new Claim(ClaimTypes.Email, request.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Task.FromResult(tokenHandler.WriteToken(token));
        }
    }
}