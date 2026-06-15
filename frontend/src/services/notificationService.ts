import api from './api';
import type { ApiResponse, Notification } from '../types';

export const notificationService = {
    getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
        const response = await api.get<ApiResponse<Notification[]>>('/notifications');
        return response.data;
    },

    markAsRead: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await api.put<ApiResponse<boolean>>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<ApiResponse<number>> => {
        const response = await api.put<ApiResponse<number>>('/notifications/read-all');
        return response.data;
    }
};
