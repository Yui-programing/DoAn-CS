import api from "./api";
import type { ApiResponse, UserProfile, UpdateProfileRequest } from "../types";

export const userService = {
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>("/users/profile");
    return response.data;
  },
  getUserProfile: async (id: string): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>(`/users/${id}/profile`);
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<ApiResponse<boolean>> => {
    const response = await api.put<ApiResponse<boolean>>(
      "/users/profile",
      data,
    );
    return response.data;
  },
  uploadAvatar: async (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<string>>(
      "/users/avatar",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
  submitArtistRegistration: async (
    formData: FormData,
  ): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(
      "/users/artist-registration",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
  uploadBanner: async (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.put<ApiResponse<string>>(
      "/artists/banner",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
