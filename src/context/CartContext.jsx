import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'foodly_cart_v1';

const CartContext = createContext(null);

function getStoredCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => getStoredCart());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product) => {
    if (!product?.id) {
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image: product.image || '',
          restaurantId: product.restaurantId ?? null,
          quantity: 1,
        },
      ];
    });
  };

  const decreaseItem = (itemId) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totals = useMemo(() => {
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.quantity * Number(item.price || 0), 0);

    return { quantity, subtotal };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      decreaseItem,
      removeItem,
      clearCart,
      totalQuantity: totals.quantity,
      subtotal: totals.subtotal,
    }),
    [items, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
