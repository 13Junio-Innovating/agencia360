import { useState } from "react";
import { createPayment, type PaymentMethod } from "../services/payments";
import { useCart } from "../store/CartContext";
import { Currency } from "../components/Currency";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { total, clear } = useCart();
  const navigate = useNavigate();

  async function handlePay(method: PaymentMethod) {
    setLoading(true);
    setResult(null);
    const res = await createPayment({ amount: total, currency: "BRL", method, orderId: "ORDER-123" });
    setLoading(false);
    if (res.checkoutUrl || res.qrCode) {
      const orderId = res.orderId ?? null;
      clear();
      navigate("/confirmacao", { state: { method, total, checkoutUrl: res.checkoutUrl, qrCode: res.qrCode, orderId } });
      return;
    }
    setResult(res.message ?? "Erro desconhecido");
  }

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">Checkout</h2>
      <p className="text-gray-600">Total do pedido: <Currency value={total} /></p>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => handlePay("mercadopago")} disabled={loading || total === 0}>MercadoPago</button>
        <button className="px-3 py-2 rounded bg-purple-600 text-white" onClick={() => handlePay("stripe")} disabled={loading || total === 0}>Stripe</button>
        <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={() => handlePay("asaas")} disabled={loading || total === 0}>Asaas</button>
        <button className="px-3 py-2 rounded bg-teal-600 text-white" onClick={() => handlePay("pix")} disabled={loading || total === 0}>Pix</button>
      </div>
      {loading && <p className="text-sm text-gray-500">Processando...</p>}
      {result && <p className="text-sm text-gray-800">{result}</p>}
    </div>
  );
}