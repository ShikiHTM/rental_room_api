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
    // MOCK DATA for Host Reservations because Backend doesn't support it yet
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'mock-booking-1',
            checkInDate: new Date().toISOString(),
            checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            totalPrice: 4500000,
            status: 'PENDING',
            roomId: 'mock-room',
            userId: 'mock-user',
            room: { id: 'mock-room', title: 'Luxury Ocean View Studio', pricePerNight: 1500000, city: 'Da Nang', address: '123 Vo Nguyen Giap', description: '', maxGuests: 2, status: 'APPROVED', hostId: 'me' },
            user: { id: 'mock-user', fullName: 'John Doe', email: 'john@example.com', role: 'USER' }
          },
          {
            id: 'mock-booking-2',
            checkInDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            checkOutDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            totalPrice: 1700000,
            status: 'CONFIRMED',
            roomId: 'mock-room-2',
            userId: 'mock-user-2',
            room: { id: 'mock-room-2', title: 'Cozy Garden House', pricePerNight: 850000, city: 'Hanoi', address: '45 Ngo Tam Thuong', description: '', maxGuests: 3, status: 'APPROVED', hostId: 'me' },
            user: { id: 'mock-user-2', fullName: 'Alice Smith', email: 'alice@example.com', role: 'USER' }
          }
        ]);
      }, 500);
    });
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
