import { supabase } from '../db/supabase';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export type SortBy = 'name' | 'price';
export type SortOrder = 'asc' | 'desc';
export interface ListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

const CACHE_TTL_MS = 30_000; // 30s de cache leve em memória
const cache = new Map<string, { ts: number; items: Product[] }>();

function makeKey({ page = 1, pageSize = 20, sortBy = 'name', sortOrder = 'asc' }: ListOptions): string {
  return JSON.stringify({ page, pageSize, sortBy, sortOrder });
}

function fromRow(row: any): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
  };
}

export async function listProducts(options: ListOptions = {}): Promise<Product[]> {
  if (!supabase) throw new Error('Supabase not configured');

  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize ?? 20));
  const sortBy: SortBy = (options.sortBy === 'price' ? 'price' : 'name');
  const sortOrder: SortOrder = (options.sortOrder === 'desc' ? 'desc' : 'asc');

  const key = makeKey({ page, pageSize, sortBy, sortOrder });
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < CACHE_TTL_MS) {
    return hit.items;
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('products')
    .select('id,name,price')
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) throw error;
  const items = (data ?? []).map(fromRow);
  cache.set(key, { ts: now, items });
  return items;
}