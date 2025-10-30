-- Tabela de produtos para a loja
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null check (price >= 0),
  created_at timestamptz not null default now()
);

-- Exemplo de seed (execute apenas uma vez conforme necessidade)
-- insert into public.products (name, price) values
--   ('Plano Básico', 49.90),
--   ('Plano Pro', 99.90),
--   ('Plano Enterprise', 199.90);