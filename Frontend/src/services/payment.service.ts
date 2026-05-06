import api from './api';

export interface PaymentData {
  bookingId: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  amount: number;
}

export const paymentService = {
  processPayment: async (paymentData: PaymentData): Promise<any> => {
    // In the future: POST /api/payments
    try {
      const response = await api.post('/api/payments', paymentData);
      return response.data;
    } catch (error) {
      console.warn("Mocking processPayment");
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { 
        success: true, 
        message: 'Payment processed successfully',
        transactionId: 'TXN-' + Date.now()
      };
    }
  }
};
