// Import axios instance mà chúng ta vừa cấu hình ở bước 2
import api from './api';
// LƯU Ý: Phải dùng 'import type' cho các kiểu dữ liệu để tuân thủ verbatimModuleSyntax
import type { ApiResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
    // Hàm đăng nhập
    login: async (data: LoginRequest): Promise<ApiResponse<string>> => {
        // Gọi POST /api/auth/login, Axios sẽ tự động cộng thêm baseURL
        const response = await api.post<ApiResponse<string>>('/auth/login', data);
        return response.data; // Chỉ trả về phần data thực sự từ backend
    },

    // Hàm đăng ký
    register: async (data: RegisterRequest): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>('/auth/register', data);
        return response.data;
    },

    // Hàm đăng xuất
    logout: async (): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>('/auth/logout');
        return response.data;
    },

    // Hàm quên mật khẩu
    forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>('/auth/forgot-password', { email });
        return response.data;
    }
};
