import api from './api';
import { type User } from './auth.service';
import { type Room } from './room.service';

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    // In the future, this will connect to GET /api/admin/users
    // For now, we simulate an API call
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      // Mock Data if backend endpoint is not ready
      console.warn("Mocking getAllUsers because backend endpoint might not exist");
      return [
        { id: 'user-1', email: 'host@test.com', fullName: 'Mock Host', role: 'HOST', createdAt: new Date().toISOString() } as User,
        { id: 'user-2', email: 'user@test.com', fullName: 'Mock User', role: 'USER', createdAt: new Date().toISOString() } as User,
      ];
    }
  },

  getAllRooms: async (): Promise<Room[]> => {
    // In the future, this will connect to GET /api/admin/rooms (which might include pending ones)
    try {
      const response = await api.get('/api/admin/rooms');
      return response.data;
    } catch (error) {
      console.warn("Mocking getAllRooms for admin");
      return [
        { id: 'room-1', title: 'Pending Villa', description: 'Need approval', address: '123 Fake', city: 'Mock City', pricePerNight: 100, maxGuests: 2, status: 'PENDING', hostId: 'user-1' } as Room
      ];
    }
  },

  updateRoomStatus: async (roomId: string, status: 'APPROVED' | 'REJECTED'): Promise<any> => {
    // In the future, this will connect to PUT /api/admin/rooms/:id/status
    try {
      const response = await api.put(`/api/admin/rooms/${roomId}/status`, { status });
      return response.data;
    } catch (error) {
      console.warn(`Mocking room status update to ${status} for room ${roomId}`);
      return { success: true, message: `Room ${status.toLowerCase()} successfully` };
    }
  },

  updateUserRole: async (userId: string, role: 'USER' | 'HOST' | 'ADMIN'): Promise<any> => {
    // In the future: PUT /api/admin/users/:id/role
    try {
      const response = await api.put(`/api/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.warn(`Mocking user role update to ${role} for user ${userId}`);
      return { success: true, message: `User role updated to ${role}` };
    }
  }
};
