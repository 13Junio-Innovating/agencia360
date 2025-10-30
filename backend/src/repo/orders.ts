import { supabase } from '../db/supabase';
import type { CreateOrderInput, Order, OrderStatus } from '../models/order';

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('orders')
    .insert({
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      status: 'pending',
      checkout_url: input.checkoutUrl ?? null,
      pix_qr_code: input.pixQrCode ?? null,
      provider_payment_id: input.providerPaymentId ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapRowToOrder(data);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }
  return mapRowToOrder(data);
}

export async function updateOrderStatus(id: string, status: OrderStatus, fields?: Partial<{ checkoutUrl: string | null; pixQrCode: string | null; providerPaymentId: string | null; }>): Promise<Order> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      checkout_url: fields?.checkoutUrl ?? undefined,
      pix_qr_code: fields?.pixQrCode ?? undefined,
      provider_payment_id: fields?.providerPaymentId ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapRowToOrder(data);
}

function mapRowToOrder(row: any): Order {
  return {
    id: String(row.id),
    amount: Number(row.amount),
    currency: String(row.currency),
    method: row.method as Order['method'],
    status: row.status as Order['status'],
    providerPaymentId: row.provider_payment_id ?? null,
    checkoutUrl: row.checkout_url ?? null,
    pixQrCode: row.pix_qr_code ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}