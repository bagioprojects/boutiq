'use client';

import { useState, useEffect } from 'react';
import { CartStore, CartItem } from './cart-store';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [freeShippingLimit, setFreeShippingLimit] = useState(1500);
  const [flatRate, setFlatRate] = useState(49.9);

  useEffect(() => {
    setItems(CartStore.getItems());
    setIsLoaded(true);

    // Kargo limitini API'den dinamik çek
    fetch('/api/settings/shipping')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.freeShippingLimit) {
          setFreeShippingLimit(Number(data.freeShippingLimit) || 1500);
          if (data.flatRate) setFlatRate(Number(data.flatRate) || 49.9);
        }
      })
      .catch(() => {});

    const unsubscribe = CartStore.subscribe((newItems) => {
      setItems(newItems);
    });

    return () => unsubscribe();
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeShipping = subtotal >= freeShippingLimit && subtotal > 0;
  const shipping = isFreeShipping || subtotal === 0 ? 0 : flatRate;
  const total = subtotal + shipping;

  return {
    items,
    isLoaded,
    cartCount,
    subtotal,
    shipping,
    total,
    freeShippingLimit,
    isFreeShipping,
    addItem: CartStore.addItem.bind(CartStore),
    updateQuantity: CartStore.updateQuantity.bind(CartStore),
    removeItem: CartStore.removeItem.bind(CartStore),
    clearCart: CartStore.clearCart.bind(CartStore),
  };
}

