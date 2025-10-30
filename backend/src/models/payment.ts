export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
export type PaymentProvider = 'mercadopago' | 'stripe' | 'asaas' | 'pix';

export interface Payment {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider_payment_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentInput {
  order_id: string;
  provider: PaymentProvider;
  status?: PaymentStatus;
  amount: number;
  currency: string;
  provider_payment_id?: string | null;
}