export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type PaymentMethod = 'mercadopago' | 'stripe' | 'asaas' | 'pix';

export interface Order {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: OrderStatus;
  providerPaymentId?: string | null;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderInput {
  amount: number;
  currency: string;
  method: PaymentMethod;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
  providerPaymentId?: string | null;
}