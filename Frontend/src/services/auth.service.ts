import api from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  phoneNumber?: string;
  bannedAt?: string | null;
}

interface LoginResponse {
  message: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    const response = await api.post('/auth/register', { email, password, fullName, phoneNumber });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<{ data: User }>('/users');
    return response.data.data;
  },

  logout: () => {
    // Rely on cookie expiration or backend logout if implemented
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
};
