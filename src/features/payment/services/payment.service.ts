import { apiClient } from '@/lib/api/api-client';
import type { PaymentConfig, PaymentOrder } from '../types/payment.types';

export const paymentService = {
  getConfig: () => apiClient.get<PaymentConfig>('payments/config'),
  createOrder: (amountVnd: number) => apiClient.post<PaymentOrder>('payments/orders', { amountVnd }),
  getOrder: (publicId: string) => apiClient.get<PaymentOrder>(`payments/orders/${publicId}`),
  reconcileOrders: () => apiClient.post<PaymentOrder[]>('payments/orders/reconcile'),
};
