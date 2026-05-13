import api from './api';
import { type User } from './auth.service';

export interface AdminStats {
  totalUsers: number;
  pendingRooms: number;
  grossPaid: number;
  platformFeeRate: number;
  platformRevenue: number;
}

export interface RoomImage {
  id: string;
  imageUrl: string;
  publicId: string;
}

export interface Room {
  id: string;
  title: string;
  description?: string | null;
  address: string;
  city: string;
  pricePerNight: number | string;
  maxGuests: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hostId: string;
  host?: { fullName: string; email?: string };
  images?: RoomImage[];
  createdAt: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  status: BookingStatus;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number | string;
  userId: string;
  userName: string;
  userEmail: string;
  roomId: string;
  roomTitle: string;
  roomCity: string;
  createdAt: string;
}

export interface PaymentRow {
  id: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  platformFee: number;
  transactionId?: string | null;
  createdAt: string;
  booking: {
    id: string;
    checkInDate: string;
    checkOutDate: string;
    user: { id: string; fullName: string; email: string };
    room: { id: string; title: string; city: string };
  } | null;
}

const unwrap = <T,>(res: any): T => res.data?.data ?? res.data;

export const adminService = {
  getStats: async (): Promise<AdminStats> => unwrap<AdminStats>(await api.get('/admin/stats')),

  // Users
  getUsers: async (): Promise<User[]> => unwrap<User[]>(await api.get('/admin/users')),
  updateUser: async (id: string, body: Partial<Pick<User, 'fullName' | 'phoneNumber' | 'role'>>): Promise<User> =>
    unwrap<User>(await api.patch(`/admin/users/${id}`, body)),
  banUser: async (id: string, banReason: string): Promise<void> => {
    await api.patch(`/admin/users/${id}/ban`, { banReason });
  },
  unbanUser: async (id: string): Promise<void> => {
    await api.patch(`/admin/users/${id}/unban`);
  },

  // Rooms
  getRooms: async (): Promise<Room[]> => unwrap<Room[]>(await api.get('/admin/rooms')),
  searchRooms: async (q: string, status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Room[]> =>
    unwrap<Room[]>(await api.get('/admin/rooms/search', { params: { q, ...(status ? { status } : {}) } })),
  approveRoom: async (id: string): Promise<void> => {
    await api.patch(`/admin/rooms/${id}/approve`);
  },
  rejectRoom: async (id: string): Promise<void> => {
    await api.patch(`/admin/rooms/${id}/reject`);
  },
  updateRoom: async (id: string, body: Partial<Pick<Room, 'title' | 'description' | 'address' | 'city' | 'pricePerNight' | 'maxGuests'>>): Promise<Room> =>
    unwrap<Room>(await api.put(`/rooms/${id}`, body)),
  getRoom: async (id: string): Promise<Room> => unwrap<Room>(await api.get(`/rooms/${id}`)),
  addRoomImages: async (id: string, images: string[]): Promise<RoomImage[]> =>
    unwrap<RoomImage[]>(await api.post(`/rooms/${id}/images`, { images })),
  removeRoomImage: async (id: string, imageId: string): Promise<void> => {
    await api.delete(`/rooms/${id}/images/${imageId}`);
  },

  // Bookings
  searchBookings: async (q: string, status?: BookingStatus): Promise<Booking[]> =>
    unwrap<Booking[]>(await api.get('/admin/bookings/search', { params: { q, ...(status ? { status } : {}) } })),
  updateBookingStatus: async (id: string, status: BookingStatus): Promise<void> => {
    await api.patch(`/admin/bookings/${id}/status`, { status });
  },

  // Payments
  listPayments: async (): Promise<PaymentRow[]> => unwrap<PaymentRow[]>(await api.get('/admin/payments')),
};
