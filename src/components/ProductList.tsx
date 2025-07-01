import { useEffect, useState } from "react";
import api from "../api";

interface Product {
  id: string;
  name: string;
  category: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.content);
    } catch {
      alert("Gagal mengambil data produk");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Daftar Produk</h2>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="border p-2 rounded">
            {p.name} ({p.category})
          </li>
        ))}
      </ul>
    </div>
  );
}