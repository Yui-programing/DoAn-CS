// Định nghĩa các TypeScript interface/type dùng chung
// Ví dụ:
// export interface User {
//   id: string;
//   name: string;
//   email: string;
// }

// export interface Product {
//   id: string;
//   title: string;
//   price: number;
// }
// === Cấu trúc Response dùng chung cho mọi API ===
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    errors: string[] | null;
}

// === Các Models (Entities) ===
export interface UserProfile {
    id: string;
    name: string;
    email: string;
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
    mediaUrl: string;
    thumbnailUrl?: string;
    mediaType: MediaType;
    duration?: number;
    uploaderId: string;
    createdAt: string;
}

export interface Playlist {
    id: string;
    title: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    tracks?: PlaylistTrack[];
}

export interface PlaylistTrack {
    id: string;
    playlistId: string;
    mediaItemId: string;
    mediaItem?: MediaItem;
    addedAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    referenceId?: string;
}

export interface SharedMedia {
    id: string;
    senderId: string;
    receiverId: string;
    mediaItemId?: string;
    playlistId?: string;
    sharedAt: string;
    message?: string;
}

// === Các Request DTOs ===
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface UpdateProfileRequest {
    bio?: string;
    avatarUrl?: string;
}
export interface CreatePlaylistRequest {
    title: string;
    description?: string;
}

export interface ShareMediaRequest {
    receiverId: string;
    mediaItemId?: string;
    playlistId?: string;
}
export interface Favorite {
    id: string;
    userId: string;
    mediaItemId: string;
    mediaItem?: MediaItem; // Tùy chọn: có thể chứa thông tin bài hát
    createdAt: string;
}

export interface PlayHistory {
    id: string;
    userId: string;
    mediaItemId: string;
    mediaItem?: MediaItem; // Tùy chọn: có thể chứa thông tin bài hát
    playedAt: string;
}

