import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Stripe from 'stripe';
import { createOrder, getOrder, updateOrderStatus } from './repo/orders';
import type { PaymentMethod } from './models/order';
import { listProducts } from './repo/products';
import { createPayment, findPaymentByProviderId, updatePaymentStatus } from './repo/payments';

dotenv.config();

export const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

app.use(cors({ origin: FRONTEND_ORIGIN }));

// Stripe webhook precisa do raw body para validação
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig || !STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ error: 'Missing signature or secret' });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const object: any = event.data.object as any;
      const orderId = object.metadata?.order_id as string | undefined;
      const providerPaymentId = object.id as string | undefined;
      if (orderId) updateOrderStatus(orderId, 'paid').catch(console.error);
      if (providerPaymentId) {
        const payment = await findPaymentByProviderId(providerPaymentId).catch(() => null);
        if (payment) await updatePaymentStatus(payment.id, 'succeeded');
      }
    }
    return res.json({ received: true });
  } catch (e) {
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Agora aplicar JSON para demais rotas
app.use(express.json());

// Middleware de logs estruturados
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    // Log JSON para fácil ingestão em observabilidade
    console.log(JSON.stringify({
      level: 'info',
      ts: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Math.round(durationMs),
      query: req.query,
    }));
  });
  next();
});

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: '1.0.0' });
});

// Listar produtos com paginação e ordenação via query params
app.get('/api/products', async (req, res) => {
  try {
    const page = Number(req.query.page ?? '1');
    const pageSize = Number(req.query.pageSize ?? '20');
    const sortBy = typeof req.query.sortBy === 'string' && ['name', 'price'].includes(req.query.sortBy)
      ? (req.query.sortBy as 'name' | 'price')
      : 'name';
    const sortOrder = typeof req.query.sortOrder === 'string' && ['asc', 'desc'].includes(req.query.sortOrder)
      ? (req.query.sortOrder as 'asc' | 'desc')
      : 'asc';

    const products = await listProducts({ page, pageSize, sortBy, sortOrder });
    return res.json(products);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao carregar produtos' });
  }
});

// Criar pagamento e persistir ordem (Stripe real com fallback)
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, currency, method } = req.body as {
      amount: number; currency: string; method: PaymentMethod;
    };
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }
    if (!['mercadopago','stripe','asaas','pix'].includes(method)) {
      return res.status(400).json({ error: 'Método inválido' });
    }

    let checkoutUrl: string | null = null;
    let pixQrCode: string | null = null;
    let providerPaymentId: string | null = null;

    if (method === 'stripe' && process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const successUrl = process.env.CHECKOUT_SUCCESS_URL || `${FRONTEND_ORIGIN}/payment-success`;
      const cancelUrl = process.env.CHECKOUT_CANCEL_URL || `${FRONTEND_ORIGIN}/payment-cancel`;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency,
            product_data: { name: 'Pagamento Agência 360' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cancelUrl}?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {},
      });
      checkoutUrl = session.url ?? null;
      providerPaymentId = session.id;
    } else if (method === 'pix') {
      providerPaymentId = `pix_${Date.now()}`;
      pixQrCode = `PIX-${providerPaymentId}-${amount}`;
    } else {
      providerPaymentId = `prov_${Date.now()}`;
      const providerBase = {
        mercadopago: 'https://www.mercadopago.com.br/checkout',
        stripe: 'https://checkout.stripe.com/pay',
        asaas: 'https://www.asaas.com/checkout',
      }[method];
      checkoutUrl = `${providerBase}?session=${providerPaymentId}&amount=${amount}&currency=${currency}`;
    }

    const order = await createOrder({ amount, currency, method, checkoutUrl, pixQrCode, providerPaymentId });
    // Persiste transação em payments
    try {
      await createPayment({ order_id: order.id, provider: method as any, amount, currency, provider_payment_id: providerPaymentId ?? null });
    } catch (err) {
      console.warn('Falha ao persistir payment', err);
    }
    return res.json({ id: order.id, method, status: order.status, checkoutUrl, pix: pixQrCode ? { qrCode: pixQrCode } : undefined });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao criar ordem' });
  }
});

// Consultar status da ordem
app.get('/api/order/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const order = await getOrder(id);
    if (!order) return res.status(404).json({ error: 'Ordem não encontrada' });
    return res.json(order);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao consultar ordem' });
  }
});

// Webhook MercadoPago (placeholder de validação)
app.post('/api/webhook/mercadopago', (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string | undefined;
    const requestId = req.headers['x-request-id'] as string | undefined;
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
    if (signature && secret) {
      const computed = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
      if (computed !== signature) return res.status(400).json({ error: 'Invalid signature' });
    }
    const payment = req.body?.data?.id as string | undefined;
    const orderId = req.body?.data?.order?.id as string | undefined;
    if (orderId) updateOrderStatus(orderId, 'paid').catch(console.error);
    res.status(200).json({ received: true });
  } catch (e) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Webhook Asaas (placeholder de validação)
app.post('/api/webhook/asaas', (req, res) => {
  try {
    const signature = (req.headers['x-asaas-signature'] || req.headers['asaas-signature']) as string | undefined;
    const secret = process.env.ASAS_WEBHOOK_SECRET || '';
    if (signature && secret) {
      const computed = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
      if (computed !== signature) return res.status(400).json({ error: 'Invalid signature' });
    }
    const orderId = req.body?.payment?.metadata?.order_id as string | undefined;
    if (orderId) updateOrderStatus(orderId, 'paid').catch(console.error);
    res.status(200).json({ received: true });
  } catch (e) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// existing app.listen call replaced with conditional
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}