import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types';

interface NotificationContextProps {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    // Lấy token từ cookie (vì frontend đang lưu cookie, ta cần hàm lấy token để truyền vào signalR query)
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return '';
    };

    const loadNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải thông báo', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            if (connection) {
                connection.stop();
                setConnection(null);
            }
            setNotifications([]);
            return;
        }

        // Tải danh sách lúc đầu
        loadNotifications();

        // Khởi tạo SignalR
        const token = getCookie('token');
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/hubs/notifications', {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect()
            .build();

        newConnection.on('ReceiveNotification', (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
        });

        newConnection.on('NotificationRead', (id: string) => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        });

        newConnection.on('NotificationsMarkedRead', (count: number) => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        });

        newConnection.start()
            .then(() => console.log('Đã kết nối SignalR'))
            .catch(e => console.error('Lỗi kết nối SignalR: ', e));

        setConnection(newConnection);

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [isAuthenticated]);

    const markAsRead = async (id: string) => {
        try {
            const res = await notificationService.markAsRead(id);
            if (res.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await notificationService.markAllAsRead();
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification phải được dùng trong NotificationProvider');
    }
    return context;
};
