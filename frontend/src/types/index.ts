// === Cấu trúc Response dùng chung cho mọi API ===
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[] | null;
}

// === Các Models (Entities & DTOs) ===

export interface UserProfile {
  id?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  genres?: string;
  bannerUrl?: string;
  verifiedAt?: string;
  isPublic?: boolean;
  followerCount?: number;
  followingCount?: number;
  playlistCount?: number;
  favoriteCount?: number;
}

export type MediaType = 0 | 1;
export const MediaTypes = {
  Audio: 0 as MediaType,
  Video: 1 as MediaType,
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
  artistName?: string;
  isPrivate: boolean;
  viewCount: number;
  approvalStatus?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  isPublic?: boolean;
  tracksCount?: number;
  createdAt?: string;
  type?: number;
  ownerId?: string;
  coverUrl?: string;
  isAlbum?: boolean;
  artistName?: string;
}

export interface PlaylistTrack {
  mediaItemId: string;
  title: string;
  durationInSeconds: number;
  mediaType?: MediaType;
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
  createdAt: string;
  // Thông tin phụ trả về từ FavoriteDto
  mediaTitle?: string;
  coverUrl?: string;
  artistName?: string;
  durationInSeconds?: number;
  mediaType?: MediaType;
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
  bannerUrl?: string;
  isPublic?: boolean;
}

export interface CreatePlaylistRequest {
  title: string;
  description?: string;
  isPublic: boolean;
}

export interface UpdatePlaylistRequest {
  title: string;
  description?: string;
  isPublic: boolean;
}

export interface ShareMediaItemRequest {
  receiverId: string;
  mediaItemId: string;
  message?: string;
}

export interface SharePlaylistRequest {
  receiverId: string; // Chú ý: Đã sửa lại thành receiverId theo C# mới
  playlistId: string;
  message?: string;
}

export interface ShareAlbumRequest {
  receiverId: string;
  albumId: string;
  message?: string;
}

export interface InboxContact {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageAt: string;
  isUnread: boolean;
}

export interface InboxResult {
  mainInbox: InboxContact[];
  messageRequests: InboxContact[];
}

export interface ChatHistoryItem {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string;
  sharedAt: string;
  mediaItemId?: string;
  playlistId?: string;
  albumId?: string;
  attachedMediaTitle?: string;
  attachedMediaCoverUrl?: string;
}

export type { AdminUser } from "./admin";
