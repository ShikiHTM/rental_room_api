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
    // In the future: GET /api/rooms/:roomId/reviews
    try {
      const response = await api.get(`/api/rooms/${roomId}/reviews`);
      return response.data;
    } catch (error) {
      console.warn("Mocking getRoomReviews");
      // Return empty array or mock reviews to test UI
      return [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Amazing place! Highly recommended.',
          userId: 'user-test',
          user: { fullName: 'John Doe', email: 'john@test.com' } as User,
          roomId,
          createdAt: new Date().toISOString()
        }
      ];
    }
  },

  createReview: async (roomId: string, reviewData: { rating: number; comment?: string; images?: string[] }): Promise<Review> => {
    // In the future: POST /api/rooms/:roomId/reviews
    try {
      const response = await api.post(`/api/rooms/${roomId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.warn("Mocking createReview");
      return {
        id: 'new-review-' + Date.now(),
        roomId,
        userId: 'current-user-id',
        rating: reviewData.rating,
        comment: reviewData.comment || null,
        images: reviewData.images?.map(url => ({ url })) || [],
        createdAt: new Date().toISOString()
      };
    }
  }
};
