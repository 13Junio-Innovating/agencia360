import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Confirmacao from "./pages/Confirmacao";
import { CartProvider } from "./store/CartContext";
import StatusPedido from "./pages/StatusPedido";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <div className="max-w-5xl mx-auto p-4">
          <nav className="flex gap-4 mb-6">
            <Link to="/" className="text-blue-600 hover:underline">Produtos</Link>
            <Link to="/cart" className="text-blue-600 hover:underline">Carrinho</Link>
            <Link to="/checkout" className="text-blue-600 hover:underline">Checkout</Link>
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            <Link to="/admin" className="text-blue-600 hover:underline">Admin</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmacao" element={<Confirmacao />} />
            <Route path="/status/:id" element={<StatusPedido />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
