import api from './api';
import type { ApiResponse, UserProfile, UpdateProfileRequest } from '../types';

export const userService = {
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
        const response = await api.get<ApiResponse<UserProfile>>('/users/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<boolean>> => {
        const response = await api.put<ApiResponse<boolean>>('/users/profile', data);
        return response.data;
    }
};
