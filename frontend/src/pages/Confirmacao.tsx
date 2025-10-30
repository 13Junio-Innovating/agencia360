import { useLocation, Link } from "react-router-dom";
import type { PaymentMethod } from "../services/payments";
import { Currency } from "../components/Currency";

interface ConfirmacaoState {
  method: PaymentMethod;
  total: number;
  checkoutUrl?: string;
  qrCode?: string;
  orderId?: string | null;
}

export default function Confirmacao() {
  const location = useLocation();
  const state = (location.state ?? {}) as ConfirmacaoState;

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">Pedido confirmado</h2>
      <p className="text-gray-600">Método: <span className="font-medium">{state.method}</span></p>
      <p className="text-gray-600">Total: <Currency value={state.total ?? 0} /></p>
      {state.checkoutUrl && (
        <p className="text-sm">Checkout: <a href={state.checkoutUrl} className="text-blue-600" target="_blank">{state.checkoutUrl}</a></p>
      )}
      {state.qrCode && (
        <p className="text-sm">Pix (parcial): {state.qrCode.substring(0, 32)}...</p>
      )}
      {state.orderId && (
        <p className="text-sm">Acompanhar status: <Link className="text-blue-600" to={`/status/${state.orderId}`}>Ver status do pedido</Link></p>
      )}
      <div className="pt-2">
        <Link className="px-3 py-2 bg-blue-600 text-white rounded" to="/">Voltar à loja</Link>
      </div>
    </div>
  );
}