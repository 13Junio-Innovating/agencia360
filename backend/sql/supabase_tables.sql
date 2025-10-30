-- Criação da tabela de ordens no Supabase
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  currency text not null,
  method text not null check (method in ('mercadopago','stripe','asaas','pix')),
  status text not null check (status in ('pending','paid','failed','cancelled')),
  provider_payment_id text,
  checkout_url text,
  pix_qr_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();