import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
    // Lấy dữ liệu đăng nhập từ AuthContext mà bạn vừa tạo ở Bước 2
    const { isAuthenticated, isLoading } = useAuth();

    // Đang gọi API kiểm tra session, hiển thị loading xoay xoay
    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <Loader2 className="animate-spin w-10 h-10 text-green-500" />
            </div>
        );
    }

    // Bị chặn! Không có quyền -> "đá" về trang /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Hợp lệ! Trả về <Outlet /> để React Router cho phép đi tiếp vào các trang bên trong
    return <Outlet />;
};
