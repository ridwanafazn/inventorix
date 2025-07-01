import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import { setAuthToken } from "./api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      setLoggedIn(true);
    }
  }, []);

  if (!loggedIn) return <LoginForm onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory App</h1>
      <AddProduct onSuccess={() => window.location.reload()} />
      <ProductList />
    </div>
  );
}