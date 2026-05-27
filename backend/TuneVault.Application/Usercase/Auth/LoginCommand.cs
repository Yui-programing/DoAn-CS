using MediatR;

namespace TuneVault.Application.UseCases.Auth
{
    // DTO đầu vào kèm theo kiểu trả về là một chuỗi (JWT Token)
    public record LoginCommand(string Email, string Password) : IRequest<string>;
}