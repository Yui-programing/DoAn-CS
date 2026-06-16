import api from "./api";
import type { ApiResponse, AdminUser } from "../types";

export const adminService = {
  getUsers: async (): Promise<ApiResponse<AdminUser[]>> => {
    const response = await api.get<ApiResponse<AdminUser[]>>("/admin/users");
    return response.data;
  },

  updateUserRole: async (
    userId: string,
    role: string,
  ): Promise<ApiResponse<boolean>> => {
    const response = await api.put<ApiResponse<boolean>>(
      `/admin/users/${userId}/role`,
      { role },
    );
    return response.data;
  },

  setUserActiveState: async (
    userId: string,
    isActive: boolean,
  ): Promise<ApiResponse<boolean>> => {
    const response = await api.put<ApiResponse<boolean>>(
      `/admin/users/${userId}/active`,
      { isActive },
    );
    return response.data;
  },
  // Artist registrations & media moderation
  getPendingArtistRegistrations: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>(
      "/admin/artist-registrations/pending",
    );
    return response.data;
  },
  approveArtistRegistration: async (
    id: string,
  ): Promise<ApiResponse<boolean>> => {
    const response = await api.put<ApiResponse<boolean>>(
      `/admin/artist-registrations/approve/${id}`,
    );
    return response.data;
  },
  getPendingMedias: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>("/admin/medias/pending");
    return response.data;
  },
  approveMedia: async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await api.put<ApiResponse<boolean>>(
      `/admin/medias/approve/${id}`,
    );
    return response.data;
  },
  rejectMedia: async (
    id: string,
    reason?: string,
  ): Promise<ApiResponse<boolean>> => {
    const response = await api.put<ApiResponse<boolean>>(
      `/admin/medias/reject/${id}`,
      { reason },
    );
    return response.data;
  },
};
