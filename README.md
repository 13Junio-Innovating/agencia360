# Agência 360

[![CI](https://github.com/13Junio-Innovating/agencia360/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/13Junio-Innovating/agencia360/actions)

Aplicação full-stack com frontend React (Vite + TypeScript + Tailwind) e backend Node/Express, integrada ao Supabase. Inclui fluxo de produtos, carrinho, checkout mock e testes automatizados.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript
- Banco: Supabase (Postgres) com Service Role para backend
- Testes: Vitest, Testing Library (frontend), Supertest (backend)

## Arquitetura
- `frontend/`: UI e rotas da loja
  - `src/pages/Products.tsx`: lista produtos consumindo `/api/products`
  - `src/store/CartContext.tsx`: estado do carrinho em `localStorage`
  - `src/services/products.ts`: serviço que chama backend
  - `src/services/supabase.ts`: cliente Supabase (para usos futuros no cliente)
  - Proxy dev (`vite.config.ts`) encaminha `/api` para backend
- `backend/`: API Express
  - `src/index.ts`: rotas e configuração de CORS/Webhooks
  - `src/repo/products.ts`: consulta produtos no Supabase via Service Role
  - `sql/supabase_products.sql`: schema e seed de `products`

## Rotas de API
- `GET /api/health`: healthcheck simples
- `GET /api/products`: lista produtos do Supabase
- `POST /api/create-payment`: simula criação de pagamento e ordem
- Webhooks de provedores (placeholders): `POST /api/webhook/*`

## Configuração
### Supabase
1. Crie um projeto no Supabase.
2. Execute `backend/sql/supabase_products.sql` para criar `public.products` e seed.
3. Habilite RLS conforme necessidade (backend usa Service Role).

### Variáveis de ambiente
- Backend (`backend/.env`):
  - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
  - `PORT=3001`
  - `FRONTEND_ORIGIN=http://localhost:5173`
  - Opcional: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MERCADOPAGO_WEBHOOK_SECRET`, `ASAS_WEBHOOK_SECRET`
- Frontend (`frontend/.env`):
  - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (se uso direto no cliente)

Atenção: não versionar chaves reais. Mantenha `.env` fora do VCS em produção.

## Desenvolvimento
### Backend
```sh
cd backend
npm i
npm run dev
```
Servidor: `http://localhost:3001`

### Frontend
```sh
cd frontend
npm i
npm run dev
```
Servidor: `http://localhost:5173` (ou alternativa se porta em uso)

O proxy do Vite encaminha chamadas `/api/*` para o backend.

## Testes
### Frontend
- Configurado Vitest com JSDOM e Testing Library
- Testes: `src/pages/Products.test.tsx`, `src/store/CartContext.test.tsx`
```sh
cd frontend
npm test -- --run
```

### Backend
- Vitest + Supertest
- Testes: `test/health.test.ts`, `test/products.test.ts`
```sh
cd backend
npm test -- --run
```

## Fluxo de Produtos
- Backend expõe `/api/products` consultando Supabase com Service Role (sem depender de RLS no cliente)
- Frontend carrega produtos, mostra estados de carregamento/erro e permite adicionar ao carrinho

## Próximos passos
- Paginação/ordenação em `/api/products`
- Cache leve no backend
- Observabilidade simples (logs estruturados)
- Deploy (ex.: Vercel/Render para frontend/backend) com variáveis seguras