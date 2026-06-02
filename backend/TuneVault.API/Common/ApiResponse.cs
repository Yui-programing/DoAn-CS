namespace TuneVault.API.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }          // Khớp trường 'success'
        public T? Data { get; set; }                // Khớp trường 'data'
        public string Message { get; set; } = null!;// Khớp trường 'message'
        public List<string> Errors { get; set; } = new(); // Khớp trường 'errors' (Mảng danh sách lỗi)

        // Hàm sinh nhanh phản hồi thành công
        public static ApiResponse<T> SetSuccess(T data, string message = "Thao tác thành công!")
            => new() { Success = true, Data = data, Message = message, Errors = new List<string>() };

        // Hàm sinh nhanh phản hồi thất bại (nhận vào danh sách lỗi chi tiết)
        public static ApiResponse<T> SetFailure(string message, List<string>? errors = null)
            => new() { Success = false, Data = default, Message = message, Errors = errors ?? new List<string>() };
    }
}