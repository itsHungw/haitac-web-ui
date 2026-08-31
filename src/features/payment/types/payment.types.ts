export interface PaymentConfig {
  enabled: boolean;
  provider: 'PAYOS';
  minAmountVnd: number;
  maxAmountVnd: number;
  amountStepVnd: number;
  coinPerVnd: number;
  orderTtlMinutes: number;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REVIEW';

export interface PaymentOrder {
  publicId: string;
  status: PaymentStatus;
  amountVnd: number;
  expectedCoin: number;
  transferContent: string;
  provider: 'PAYOS';
  qrCode: string;
  checkoutUrl: string;
  bankCode: string;
  bankAccount: string;
  bankAccountName: string;
  expiresAt: string;
  paidAt: string | null;
  coinBalance: number | null;
}
