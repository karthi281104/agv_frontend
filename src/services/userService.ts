import { apiClient } from './apiClient';

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
    };
    profile: Record<string, any>;
  };
}

export const userService = {
  getMe: () => apiClient.get<UserProfileResponse>('/users/me'),
  updateMe: (payload: { firstName?: string; lastName?: string; email?: string; profile?: Record<string, any>; }) =>
    apiClient.put<UserProfileResponse>('/users/me', payload),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiClient.put<{ success: boolean; message: string }>('/users/me/password', payload),
};

export default userService;
