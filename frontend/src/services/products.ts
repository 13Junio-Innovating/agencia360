export interface Product {
  id: string;
  name: string;
  price: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const data = await res.json() as Product[];
  return data;
}