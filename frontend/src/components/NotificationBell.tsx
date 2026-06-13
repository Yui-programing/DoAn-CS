import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import type { Notification } from '../types';

export const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
        navigate('/notifications');
    };

    const parsePayload = (payloadJson: string) => {
        try {
            const data = JSON.parse(payloadJson);
            return data.message || data.content || "Có thông báo mới";
        } catch {
            return payloadJson;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(date);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Thông báo"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-950"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[32rem] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
                        <h3 className="font-bold text-slate-100">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={() => markAllAsRead()}
                                className="text-xs text-green-400 hover:text-green-300 font-semibold hover:underline flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                Đánh dấu đã đọc tất cả
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
                                <Bell className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">Chưa có thông báo nào.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-3 rounded-lg flex gap-3 cursor-pointer transition-colors ${
                                        notif.isRead 
                                            ? 'hover:bg-zinc-800/50 opacity-70' 
                                            : 'bg-zinc-800 hover:bg-zinc-700 border-l-2 border-green-500'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bell className={`w-4 h-4 ${notif.isRead ? 'text-zinc-400' : 'text-green-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm break-words ${notif.isRead ? 'text-zinc-300' : 'text-slate-100 font-semibold'}`}>
                                            {parsePayload(notif.payloadJson)}
                                        </p>
                                        <span className="text-[10px] text-zinc-500 block mt-1">
                                            {formatDate(notif.createdAt)}
                                        </span>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
