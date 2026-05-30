import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart', { product_id: productId, quantity });
    await fetchCart();
    return res.data;
  };

  const updateQuantity = async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity });
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, total, count, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
