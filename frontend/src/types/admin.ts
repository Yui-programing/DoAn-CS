export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}
