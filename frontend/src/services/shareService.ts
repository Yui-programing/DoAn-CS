import api from './api';
import type { ApiResponse, ShareMediaItemRequest, SharePlaylistRequest, ShareAlbumRequest } from '../types';

export const shareService = {
    shareMedia: async (data: ShareMediaItemRequest): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>('/share/media', data);
        return response.data;
    },

    sharePlaylist: async (data: SharePlaylistRequest): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>('/share/playlist', data);
        return response.data;
    },

    shareAlbum: async (data: ShareAlbumRequest): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>('/share/album', data);
        return response.data;
    }
};
