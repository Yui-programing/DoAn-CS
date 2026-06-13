import api from './api';
import type { ApiResponse, Playlist, PlaylistTrack, CreatePlaylistRequest } from '../types';

export const playlistService = {
    getMyPlaylists: async (): Promise<ApiResponse<Playlist[]>> => {
        const response = await api.get<ApiResponse<Playlist[]>>('/playlists');
        return response.data;
    },

    createPlaylist: async (data: CreatePlaylistRequest): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>('/playlists', data);
        return response.data;
    },

    updatePlaylist: async (id: string, data: CreatePlaylistRequest): Promise<ApiResponse<string>> => {
        const response = await api.put<ApiResponse<string>>(`/playlists/${id}`, data);
        return response.data;
    },

    deletePlaylist: async (id: string): Promise<ApiResponse<string>> => {
        const response = await api.delete<ApiResponse<string>>(`/playlists/${id}`);
        return response.data;
    },

    getTracks: async (id: string): Promise<ApiResponse<PlaylistTrack[]>> => {
        const response = await api.get<ApiResponse<PlaylistTrack[]>>(`/playlists/${id}/tracks`);
        return response.data;
    },

    addTrack: async (id: string, mediaItemId: string): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>(`/playlists/${id}/tracks`, { mediaItemId });
        return response.data;
    },

    removeTrack: async (id: string, trackId: string): Promise<ApiResponse<string>> => {
        const response = await api.delete<ApiResponse<string>>(`/playlists/${id}/tracks/${trackId}`);
        return response.data;
    }
};
