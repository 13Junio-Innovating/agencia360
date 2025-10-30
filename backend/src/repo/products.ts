import { supabase } from '../db/supabase';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export async function listProducts(): Promise<Product[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('products')
    .select('id,name,price')
    .order('name');
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
  }));
}