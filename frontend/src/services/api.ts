import axios from 'axios';
// QUAN TRỌNG: Dùng 'import type' cho các Interface/Type để không bị lỗi ts(1484)
import type { AxiosResponse, AxiosError } from 'axios';

const api = axios.create({
    // Lấy URL từ biến môi trường (như đã cấu hình trong docker-compose), mặc định fallback về localhost:5000
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',

    // RẤT QUAN TRỌNG: Bật tính năng này để trình duyệt tự động gửi kèm HttpOnly Cookie (chứa JWT) lên Backend
    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor bắt lỗi Response
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Trả về response nguyên vẹn nếu thành công
        return response;
    },
    (error: AxiosError) => {
        // Bắt lỗi 401 (Unauthorized - Chưa đăng nhập / Hết hạn token)
        if (error.response && error.response.status === 401) {
            console.warn('Lỗi 401: Không có quyền truy cập hoặc phiên đã hết hạn.');

            // Xoá cờ hiệu đánh dấu trạng thái đăng nhập ở Frontend
            localStorage.removeItem('isAuthenticated');

            // Kiểm tra xem trang hiện tại có phải là trang công khai (Public Route) không
            const publicPaths = ['/', '/search', '/register', '/forgot-password'];
            const isPublicPath = publicPaths.includes(window.location.pathname) || 
                                 window.location.pathname.startsWith('/playlist/');

            // Chỉ chuyển hướng về trang đăng nhập nếu người dùng đang ở trang riêng tư (Private Route)
            if (!isPublicPath && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }


        return Promise.reject(error);
    }
);

export default api;
