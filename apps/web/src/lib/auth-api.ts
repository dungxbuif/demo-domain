import api from './api';

export interface User {
  id: number;
  mezonUserId: string;
  name: string;
  email: string;
  role: number;
  status: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  // Get user profile
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get login URL (for redirect)
  getLoginUrl: (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiUrl}/auth/login`;
  },
};
