import api from './api';
import type { ApiResponse, SharedMedia, ShareMediaRequest } from '../types';

export const shareService = {
    shareMedia: async (data: ShareMediaRequest): Promise<ApiResponse<SharedMedia>> => {
        const response = await api.post<ApiResponse<SharedMedia>>('/share', data);
        return response.data;
    },

    getInbox: async (): Promise<ApiResponse<SharedMedia[]>> => {
        const response = await api.get<ApiResponse<SharedMedia[]>>('/share');
        return response.data;
    }
};
