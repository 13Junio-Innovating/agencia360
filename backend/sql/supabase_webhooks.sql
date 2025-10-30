-- Registro de eventos de webhook recebidos para auditoria e retry
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('mercadopago','stripe','asaas')),
  event_type text not null,
  payload jsonb not null,
  signature text,
  received_at timestamptz not null default now(),
  processed boolean not null default false,
  error text
);

create index if not exists webhook_events_provider_idx on public.webhook_events(provider);
create index if not exists webhook_events_processed_idx on public.webhook_events(processed);