import api from './api-simple';

export interface User {
  id: number;
  mezonUserId: string;
  name: string;
  email: string;
  role: number;
  status: number;
}

export const authApi = {
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    console.log('getProfile response:', response);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getLoginUrl: (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiUrl}/auth/login`;
  },
};
