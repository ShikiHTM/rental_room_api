import api from './api';
import { type User } from './auth.service';

export interface Room {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  pricePerNight: number;
  maxGuests: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hostId: string;
  host?: User;
  images?: { url: string }[];
}

export const roomService = {
  getAllRooms: async (): Promise<Room[]> => {
    const response = await api.get<Room[]>('/rooms');
    return response.data;
  },

  getRoomById: async (id: string): Promise<Room> => {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  applyToBeHost: async (roomData?: any) => {
    const response = await api.post('/rooms/apply', roomData);
    return response.data;
  },

  createRoom: async (roomData: Omit<Partial<Room>, 'images'> & { images?: string[] }) => {
    const response = await api.post('/rooms/create', roomData);
    return response.data;
  },

  updateRoom: async (id: string, roomData: Omit<Partial<Room>, 'images'> & { images?: string[] }) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  }
};
