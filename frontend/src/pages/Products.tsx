import { useCart } from "../store/CartContext";
import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "../services/products";

export default function Products() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        if (active) setProducts(data);
      } catch (e) {
        if (active) setError("Não foi possível carregar produtos.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="p-6">Carregando produtos...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Produtos</h2>
      <p className="mt-2 text-gray-600">Escolha um plano e adicione ao carrinho.</p>
      {products.length === 0 ? (
        <p className="mt-4 text-gray-600">Nenhum produto disponível.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {products.map((p) => (
            <div key={p.id} className="border rounded p-4">
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm text-gray-600">R$ {p.price.toFixed(2)}</p>
              <button
                className="mt-2 px-3 py-2 rounded bg-blue-600 text-white"
                onClick={() => addItem({ id: p.id, name: p.name, price: p.price })}
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}