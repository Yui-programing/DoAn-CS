import { useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export const NotificationBell = () => {
    const { unreadCount } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isActive = location.pathname === '/notifications';

    const handleClick = () => {
        navigate('/notifications');
    };

    return (
        <div className="relative">
            <button 
                onClick={handleClick}
                className={`relative p-2 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none ${
                    isActive ? 'text-white bg-[#1f1f1f]' : 'text-zinc-400 hover:text-slate-100'
                }`}
                aria-label="Thông báo"
            >
                <Bell className="w-5 h-5" fill={isActive ? "currentColor" : "none"} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-zinc-950">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
};
