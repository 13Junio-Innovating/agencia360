import { useCart } from "../store/CartContext";
import { Link } from "react-router-dom";
import { Currency } from "../components/Currency";

export default function Cart() {
  const { items, removeItem, clear, total } = useCart();
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Carrinho</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-gray-600">Seu carrinho está vazio. <Link to="/" className="text-blue-600">Ver produtos</Link></p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-gray-600">Qtd: {i.qty}</div>
              </div>
              <div className="flex items-center gap-3">
                <Currency value={i.price * i.qty} />
                <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => removeItem(i.id)}>Remover</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="font-medium">Total</div>
            <Currency value={total} />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-gray-200 rounded" onClick={clear}>Limpar</button>
            <Link to="/checkout" className="px-3 py-2 bg-green-600 text-white rounded">Ir para Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}