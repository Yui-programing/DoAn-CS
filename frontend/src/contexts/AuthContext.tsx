import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { userService } from '../services/userService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    loginState: () => void;
    logoutState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Khi F5 lại trang, gọi API profile để kiểm tra xem cookie còn hợp lệ không
        const checkAuth = async () => {
            try {
                await userService.getProfile();
                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
            } catch (error) {
                setIsAuthenticated(false);
                localStorage.removeItem('isAuthenticated');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const loginState = () => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
    };

    const logoutState = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, loginState, logoutState }}>
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
