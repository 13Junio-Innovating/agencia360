export type PaymentMethod = "mercadopago" | "stripe" | "asaas" | "pix";

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  orderId: string;
}

export interface PaymentResponse {
  status: "created" | "error";
  checkoutUrl?: string;
  qrCode?: string;
  message?: string;
  orderId?: string;
}

export async function createPayment(req: PaymentRequest): Promise<PaymentResponse> {
  try {
    const res = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      return { status: 'error', message: `Erro ${res.status}` };
    }
    const data = await res.json() as {
      id: string;
      method: PaymentMethod;
      status: 'pending' | 'created';
      checkoutUrl?: string;
      pix?: { qrCode: string };
    };
    if (data.pix?.qrCode) {
      return { status: 'created', qrCode: data.pix.qrCode, orderId: data.id };
    }
    if (data.checkoutUrl) {
      return { status: 'created', checkoutUrl: data.checkoutUrl, orderId: data.id };
    }
    return { status: 'error', message: 'Resposta sem dados de checkout' };
  } catch {
    return { status: 'error', message: 'Falha na requisição ao backend' };
  }
}