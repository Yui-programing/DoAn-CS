import api from './api';
import type { ApiResponse } from '../types';

export interface CreateAlbumRequest {
    title: string;
    coverImageUrl?: string;
    releaseDate: string;
    trackIds: string[];
}

export const albumService = {
    createAlbum: async (data: CreateAlbumRequest): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>('/albums', data);
        return response.data;
    },

    getAlbumsByArtist: async (artistId: string): Promise<ApiResponse<any[]>> => {
        const response = await api.get<ApiResponse<any[]>>(`/albums/artist/${artistId}`);
        return response.data;
    },

    getAlbumById: async (id: string): Promise<ApiResponse<any>> => {
        const response = await api.get<ApiResponse<any>>(`/albums/${id}`);
        return response.data;
    },

    getTracks: async (id: string): Promise<ApiResponse<any[]>> => {
        const response = await api.get<ApiResponse<any[]>>(`/albums/${id}/tracks`);
        return response.data;
    }
};
