import api from './api';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE';

export interface PaymentData {
  bookingId: string;
  method: PaymentMethod;
  amount: number;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; planned: boolean }[] = [
  { value: 'CASH', label: 'Cash on Arrival', planned: false },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', planned: true },
  { value: 'ONLINE', label: 'Credit Card / Online', planned: true },
];

export const paymentService = {
  processPayment: async (paymentData: PaymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
};
