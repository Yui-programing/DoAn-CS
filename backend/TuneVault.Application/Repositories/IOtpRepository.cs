using System;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Repositories
{
    public interface IOtpRepository
    {
        Task<bool> AddAsync(OtpVerification otp); //Lưu OTP vào csdl
        Task<OtpVerification?> GetLatestUnusedOtpAsync(string email, string purpose); // Lấy OTP mới nhất chưa được sử dụng
        Task<bool> MarkAsUsedAsync(Guid id); // Đánh dấu OTP đã được sử dụng
    }
}
