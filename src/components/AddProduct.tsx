import { useState, FormEvent } from "react";
import api from "../api";

interface AddProductProps {
  onSuccess: () => void;
}

export default function AddProduct({ onSuccess }: AddProductProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/products", { name, category });
      onSuccess();
      setName("");
      setCategory("");
    } catch {
      alert("Gagal menambahkan produk");
    }
  };

  return (
    <form onSubmit={handleAdd} className="max-w-sm mx-auto mt-6 space-y-2">
      <input
        type="text"
        placeholder="Nama Produk"
        required
        className="border p-2 w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Kategori"
        required
        className="border p-2 w-full"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button
        type="submit"
        className="bg-green-600 text-white w-full py-2 rounded"
      >
        Tambah Produk
      </button>
    </form>
  );
}