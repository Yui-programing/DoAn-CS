import api from "./api";
import type { ApiResponse, UserProfile } from "../types";

export const followService = {
  followArtist: async (followingUserId: string): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>(`/follows/follow/${followingUserId}`);
    return response.data;
  },

  unfollowArtist: async (followingUserId: string): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>(`/follows/unfollow/${followingUserId}`);
    return response.data;
  },

  checkFollowStatus: async (followingUserId: string): Promise<ApiResponse<boolean>> => {
    const response = await api.get<ApiResponse<boolean>>(`/follows/status/${followingUserId}`);
    return response.data;
  },

  getFollowingArtists: async (): Promise<ApiResponse<UserProfile[]>> => {
    const response = await api.get<ApiResponse<UserProfile[]>>("/follows/following");
    return response.data;
  }
};
