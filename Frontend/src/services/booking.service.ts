import api from './api';
import { type Room } from './room.service';
import { type User } from './auth.service';

export interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  roomId: string;
  room?: Room;
  userId: string;
  user?: User;
}

export const bookingService = {
  createBooking: async (bookingData: { roomId: string, checkIn: string, checkOut: string }) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getHostReservations: async (): Promise<Booking[]> => {
    const response = await api.get<{ data: Booking[] }>('/bookings/host');
    return response.data.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },

  cancelBooking: async (id: string) => {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  }
};
