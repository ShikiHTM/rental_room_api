import api from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  phoneNumber?: string | null;
  bannedAt?: string | null;
  banReason?: string | null;
  banExpiresAt?: string | null;
  createdAt?: string;
}

interface LoginResponse {
  message: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<{ data: User }>('/users');
    return res.data.data;
  },
  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* server may already be invalid */ }
  },
};
