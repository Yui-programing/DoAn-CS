using System.Collections.Generic;

namespace TuneVault.Application.Models
{
    public class ApiResponseDto<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }

        // Hàm hỗ trợ tạo cục dữ liệu thành công nhanh chóng
        public static ApiResponseDto<T> Ok(T data, string message = "Thao tác thành công!")
        {
            return new ApiResponseDto<T>
            {
                Success = true,
                Data = data,
                Message = message,
                Errors = null
            };
        }

        // Hàm hỗ trợ tạo cục báo lỗi 
        public static ApiResponseDto<T> Fail(List<string> errors, string message = "Có lỗi xảy ra!")
        {
            return new ApiResponseDto<T>
            {
                Success = false,
                Data = default,
                Message = message,
                Errors = errors
            };
        }
    }
}