import api from './api';
import { type User } from './auth.service';
import { type Room } from './room.service';

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data?.data || response.data;
  },

  getAllRooms: async (): Promise<Room[]> => {
    const response = await api.get('/admin/rooms');
    return response.data?.data || response.data;
  },

  updateRoomStatus: async (roomId: string, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
    const endpoint = status === 'APPROVED' ? `/admin/rooms/${roomId}/approve` : `/admin/rooms/${roomId}/reject`;
    const response = await api.patch(endpoint);
    return response.data;
  },

  banUser: async (userId: string, banReason: string = 'Violated terms of service'): Promise<any> => {
    const response = await api.patch(`/admin/users/${userId}/ban`, { banReason });
    return response.data;
  },

  unbanUser: async (userId: string): Promise<any> => {
    const response = await api.patch(`/admin/users/${userId}/unban`);
    return response.data;
  }
};
