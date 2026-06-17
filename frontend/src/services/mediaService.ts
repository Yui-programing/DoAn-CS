import api from './api';
import type { ApiResponse, MediaItem, Favorite, PlayHistory } from '../types';

export const mediaService = {
    // Để gửi file lên backend, Axios phải dùng FormData thay vì JSON
    uploadMedia: async (formData: FormData): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>('/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getMyMedia: async (): Promise<ApiResponse<MediaItem[]>> => {
        const response = await api.get<ApiResponse<MediaItem[]>>('/media/my-media');
        return response.data;
    },

    getMediaDetails: async (id: string): Promise<ApiResponse<MediaItem>> => {
        const response = await api.get<ApiResponse<MediaItem>>(`/media/${id}`);
        return response.data;
    },

    // Hàm tiện ích: Trả về thẳng URL dạng string để nhét vào thuộc tính src="" của thẻ <audio>/<video>
    getStreamUrl: (id: string) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        return `${baseUrl}/media/${id}/stream`;
    },

    // Hàm tiện ích: Tạo full URL cho ảnh bìa (coverUrl) nếu nó là đường dẫn relative
    getImageUrl: (coverUrl: string | null | undefined) => {
        if (!coverUrl) return '';
        // Nếu là link Cloudinary hoặc external link thì giữ nguyên
        if (coverUrl.startsWith('http')) return coverUrl;
        
        // Lấy gốc URL của backend (Bỏ chữ /api đi)
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const rootUrl = baseUrl.replace('/api', '');
        
        return `${rootUrl}${coverUrl.startsWith('/') ? '' : '/'}${coverUrl}`;
    },

    // --- Chức năng Tương tác (Thả tim) ---
    addFavorite: async (mediaItemId: string): Promise<ApiResponse<boolean>> => {
        const response = await api.post<ApiResponse<boolean>>('/favorites', { mediaItemId });
        return response.data;
    },

    removeFavorite: async (mediaItemId: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/favorites/${mediaItemId}`);
        return response.data;
    },

    getFavorites: async (): Promise<ApiResponse<Favorite[]>> => {
        const response = await api.get<ApiResponse<Favorite[]>>('/favorites');
        return response.data;
    },

    // --- Chức năng Lịch sử nghe nhạc ---
    recordPlayHistory: async (mediaItemId: string): Promise<ApiResponse<boolean>> => {
        const response = await api.post<ApiResponse<boolean>>('/history', { mediaItemId });
        return response.data;
    },

    getPlayHistory: async (limit: number = 10): Promise<ApiResponse<PlayHistory[]>> => {
        const response = await api.get<ApiResponse<PlayHistory[]>>('/history', {
            params: { limit }
        });
        return response.data;
    },

    searchSongs: async (keyword: string, pageSize: number = 10): Promise<ApiResponse<any>> => {
        const response = await api.get<ApiResponse<any>>('/search/full', {
            params: { keyword, filterType: 'Song', pageSize }
        });
        return response.data;
    },

    searchAll: async (keyword: string, pageSize: number = 20): Promise<ApiResponse<any>> => {
        const response = await api.get<ApiResponse<any>>('/search/full', {
            params: { keyword, pageSize }
        });
        return response.data;
    },

    searchQuick: async (keyword: string): Promise<ApiResponse<any[]>> => {
        const response = await api.get<ApiResponse<any[]>>('/search/quick', {
            params: { keyword }
        });
        return response.data;
    }
};
