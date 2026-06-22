import api from './api';
import type { ApiResponse, InboxResult, ChatHistoryItem } from '../types';

export const inboxService = {
    getContacts: async (): Promise<ApiResponse<InboxResult>> => {
        const response = await api.get<ApiResponse<InboxResult>>('/inbox/contacts');
        return response.data;
    },

    getChatHistory: async (otherUserId: string): Promise<ApiResponse<ChatHistoryItem[]>> => {
        const response = await api.get<ApiResponse<ChatHistoryItem[]>>(`/inbox/chat/${otherUserId}`);
        return response.data;
    },

    acceptMessageRequest: async (senderId: string): Promise<ApiResponse<boolean>> => {
        const response = await api.post<ApiResponse<boolean>>(`/inbox/accept/${senderId}`);
        return response.data;
    }
};
