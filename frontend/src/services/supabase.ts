import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY ?? ''
);