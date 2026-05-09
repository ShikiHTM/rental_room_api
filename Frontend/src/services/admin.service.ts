import api from './api';
import { type User } from './auth.service';
import { type Room } from './room.service';
import toast from 'react-hot-toast';

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data?.data ?? response.data;
  },

  getAllRooms: async (): Promise<Room[]> => {
    const response = await api.get('/admin/rooms');
    return response.data?.data ?? response.data;
  },

  updateRoomStatus: async (roomId: string, action: 'APPROVE' | 'REJECT'): Promise<any> => {
    try {
      const endpoint = action === 'APPROVE' ? `/admin/rooms/${roomId}/approve` : `/admin/rooms/${roomId}/reject`;
      const response = await api.patch(endpoint);
      toast.success(`Room ${action.toLowerCase()}d successfully`);
      return response.data?.data || response.data;
    } catch (error) {
      toast.error(`Failed to update room status with action ${action}`);
      throw error;
    }
  },

  banUser: async (userId: string, banReason: string = 'Violated terms of service'): Promise<any> => {
    try {
      const response = await api.patch(`/admin/users/${userId}/ban`, { banReason });
      toast.success('User has been banned.');
      return response.data?.data || response.data;
    } catch (error) {
      toast.error('Failed to ban user');
      throw error;
    }
  },

  unbanUser: async (userId: string): Promise<any> => {
    try {
      const response = await api.patch(`/admin/users/${userId}/unban`);
      toast.success('User has been unbanned.');
      return response.data?.data || response.data;
    } catch (error) {
      toast.error('Failed to unban user');
      throw error;
    }
  }
};
