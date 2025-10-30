import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Currency } from "../components/Currency";

interface OrderData {
  id: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  amount: number;
  currency: string;
  method: string;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
}

export default function StatusPedido() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/order/${id}`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json() as OrderData;
        if (active) setOrder(data);
      } catch (e) {
        if (active) setError("Não foi possível carregar o pedido.");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchOrder();
    const timer = setInterval(fetchOrder, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [id]);

  if (loading) return <div className="p-6">Carregando status...</div>;
  if (error) return <div className="p-6">{error}</div>;
  if (!order) return <div className="p-6">Pedido não encontrado.</div>;

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">Status do Pedido</h2>
      <p className="text-gray-600">ID: <span className="font-mono">{order.id}</span></p>
      <p className="text-gray-600">Status: <span className="font-medium">{order.status}</span></p>
      <p className="text-gray-600">Total: <Currency value={order.amount} /> ({order.currency})</p>
      <p className="text-gray-600">Método: <span className="font-medium">{order.method}</span></p>
      {order.checkoutUrl && (
        <p className="text-sm">Checkout: <a href={order.checkoutUrl} className="text-blue-600" target="_blank">{order.checkoutUrl}</a></p>
      )}
      {order.pixQrCode && (
        <p className="text-sm">Pix (parcial): {order.pixQrCode.substring(0, 32)}...</p>
      )}
      <div className="pt-2">
        <Link className="px-3 py-2 bg-blue-600 text-white rounded" to="/">Voltar à loja</Link>
      </div>
    </div>
  );
}