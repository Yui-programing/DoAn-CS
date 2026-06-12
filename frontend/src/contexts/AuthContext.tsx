import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { userService } from '../services/userService';
import type { UserProfile } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserProfile | null;
    loginState: () => void;
    logoutState: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuth = async () => {
        // Kiểm tra cờ đăng nhập cục bộ trước để tránh gửi request dư thừa bị 401 khi chưa đăng nhập
        const hasAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
        if (!hasAuthFlag) {
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await userService.getProfile();
            if (response.success && response.data) {
                setIsAuthenticated(true);
                setUser(response.data);
                localStorage.setItem('isAuthenticated', 'true');
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('isAuthenticated');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const loginState = async () => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        // Gọi checkAuth để lấy thông tin User Profile mới nhất
        await checkAuth();
    };

    const logoutState = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
    };

    const refreshUser = async () => {
        try {
            const response = await userService.getProfile();
            if (response.success && response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải lại thông tin user:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, loginState, logoutState, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
