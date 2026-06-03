using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using TuneVault.Application.Models;

namespace TuneVault.API.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Cho phép request đi tiếp bình thường
                await _next(context);
            }
            catch (Exception ex)
            {
                // Nếu có lỗi xảy ra ở bất kỳ đâu, lập tức nhảy vào đây xử lý
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            // Mặc định các lỗi lạ khác sẽ là 500 Internal Server Error
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            var message = "Đã có lỗi hệ thống xảy ra.";
            System.Collections.Generic.List<string>? errors = null;

            // BẮT RIÊNG LỖI VALIDATION (Lỗi nhập liệu từ FluentValidation)
            if (exception is ValidationException validationException)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest; // Trả về mã 400 chuyên cho lỗi dữ liệu
                message = "Dữ liệu đầu vào không hợp lệ!";
                // Gom toàn bộ tin nhắn lỗi lại thành một mảng
                errors = validationException.Errors
                    .Select(e => e.ErrorMessage)
                    .ToList();
            }

            // Đóng gói vào hộp ApiResponseDto chuẩn hóa đúng như hợp đồng với Frontend
            var response = ApiResponseDto<object>.Fail(errors, message);

            // Cấu hình định dạng chữ thường (camelCase) cho JSON để khớp với Frontend
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var jsonResult = JsonSerializer.Serialize(response, options);
            return context.Response.WriteAsync(jsonResult);
        }
    }
}