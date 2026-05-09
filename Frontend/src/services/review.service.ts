import api from './api';
import { type User } from './auth.service';

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  user?: User;
  roomId: string;
  images?: { url: string }[];
  createdAt?: string;
}

export const reviewService = {
  getRoomReviews: async (roomId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/${roomId}`);
    return response.data?.data || response.data;
  },

  createReview: async (bookingId: string, reviewData: { rating: number; comment?: string; images?: string[] }): Promise<Review> => {
    const response = await api.post(`/reviews`, {
      bookingId,
      ...reviewData
    });
    return response.data?.data || response.data;
  }
};
