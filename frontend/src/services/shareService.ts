import api from './api';
import type { ApiResponse, SharedMediaItem, ShareMediaItemRequest } from '../types';

export const shareService = {
    shareMedia: async (data: ShareMediaItemRequest): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>('/share', data);
        return response.data;
    },

    getInbox: async (): Promise<ApiResponse<SharedMediaItem[]>> => {
        const response = await api.get<ApiResponse<SharedMediaItem[]>>('/share');
        return response.data;
    }
};
