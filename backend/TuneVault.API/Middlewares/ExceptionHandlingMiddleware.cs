using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TuneVault.API.Common;

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

            // 1. Cấu hình mặc định cho các lỗi hệ thống không xác định (500)
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            var message = "Đã có lỗi hệ thống xảy ra.";
            var errors = new List<string> { exception.Message };

            // 2. Phân loại và bẫy các Exception cụ thể từ tầng Application quăng ra
            if (exception is ValidationException validationException)
            {
                // Lỗi nhập liệu từ FluentValidation
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                message = "Dữ liệu đầu vào không hợp lệ!";
                errors = validationException.Errors
                    .Select(e => e.ErrorMessage)
                    .ToList();
            }
            else if (exception is UnauthorizedAccessException)
            {
                // Lỗi khi check IsOwnerAsync thất bại (Không có quyền)
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                message = "Bạn không có quyền thực hiện thao tác này.";
            }
            else if (exception is InvalidOperationException || exception is ArgumentException)
            {
                // Lỗi logic nghiệp vụ (Ví dụ: Track đã tồn tại trong playlist)
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                message = exception.Message; // Lấy trực tiếp câu chữ bạn quăng ra từ Handler
            }

            // 3. Đóng gói vào ApiResponse chuẩn hóa theo đúng cấu trúc file của bạn
            var response = ApiResponse<object>.SetFailure(errors, message);

            // 4. Sử dụng WriteAsJsonAsync để tự động serialize sang camelCase và gửi về Client
            return context.Response.WriteAsJsonAsync(response);
        }
    }
}