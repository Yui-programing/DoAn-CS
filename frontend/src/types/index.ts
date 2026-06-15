// === Cấu trúc Response dùng chung cho mọi API ===
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    errors: string[] | null;
}

// === Các Models (Entities & DTOs) ===

export interface UserProfile {
    id: string;
    fullName: string;
    bio?: string;
    avatarUrl?: string;
}

export type MediaType = 0 | 1;
export const MediaTypes = {
    Audio: 0 as MediaType,
    Video: 1 as MediaType
};

export interface MediaItem {
    id: string;
    title: string;
    description?: string;
    filePath: string;
    coverUrl?: string;
    durationInSeconds: number;
    mediaType: MediaType;
    ownerId: string;
    albumId?: string;
    artistId?: string;
    isPrivate: boolean;
    viewCount: number;
}

export interface Playlist {
    id: string;
    title: string;
    description?: string;
    isPublic: boolean;
    tracksCount: number;
    type: number;
    createdAt: string;
}

export interface PlaylistTrack {
    mediaItemId: string;
    title: string;
    durationInSeconds: number;
    addedAt: string;
}

export interface SharedMediaItem {
    mediaItemId: string;
    senderId: string;
    receiverId: string;
    sharedAt: string;
    message?: string;
}

export interface SharedPlaylist {
    playlistId: string;
    senderId: string;
    receiverId: string;
    sharedAt: string;
    message?: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: number;
    payloadJson: string;
    isRead: boolean;
    createdAt: string;
}

export interface Favorite {
    id: string;
    userId: string;
    mediaItemId: string;
    mediaItem?: MediaItem;
    createdAt: string;
}

export interface PlayHistory {
    id: string;
    userId: string;
    mediaItemId: string;
    mediaItem?: MediaItem;
    playedAt: string;
}

// === Các Request DTOs (Dùng khi gửi POST/PUT) ===
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    otpCode: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otpCode: string;
    newPassword: string;
}

export interface UpdateProfileRequest {
    fullName: string;
    bio?: string;
    avatarUrl?: string;
}

export interface CreatePlaylistRequest {
    title: string;
    description?: string;
    isPublic: boolean;
    type: number;
}

export interface UpdatePlaylistRequest {
    title: string;
    description?: string;
    isPublic: boolean;
    type: number;
}

export interface ShareMediaItemRequest {
    receiverId: string;
    mediaItemId: string;
    message?: string;
}

export interface SharePlaylistRequest {
    receiverid: string; // Chú ý: Backend C# đang viết chữ 'i' thường (ShareDto.cs)
    playlistId: string;
    message?: string;
}
