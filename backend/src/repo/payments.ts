import { supabase } from '../db/supabase';
import type { CreatePaymentInput, Payment, PaymentStatus } from '../models/payment';

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('payments')
    .insert({
      order_id: input.order_id,
      provider: input.provider,
      status: input.status ?? 'pending',
      amount: input.amount,
      currency: input.currency,
      provider_payment_id: input.provider_payment_id ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapPayment(data);
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapPayment(data);
}

export async function findPaymentByProviderId(providerPaymentId: string): Promise<Payment | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('provider_payment_id', providerPaymentId)
    .single();
  if (error) {
    if ((error as any).code === 'PGRST116') return null;
    throw error;
  }
  return mapPayment(data);
}

function mapPayment(row: any): Payment {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    provider: row.provider,
    status: row.status,
    amount: Number(row.amount),
    currency: String(row.currency),
    provider_payment_id: row.provider_payment_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}