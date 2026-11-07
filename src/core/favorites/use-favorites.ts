'use client';

import { useState, useEffect } from 'react';
import { FavoriteItem, FavoriteStore } from './favorite-store';

export function useFavorites() {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // İlk yükleme
    const initial = FavoriteStore.getItems();
    setFavoriteItems(initial);
    setFavoriteCount(initial.length);
    setIsLoaded(true);

    // Abonelik
    const unsubscribe = FavoriteStore.subscribe((updatedItems) => {
      setFavoriteItems(updatedItems);
      setFavoriteCount(updatedItems.length);
    });

    return () => unsubscribe();
  }, []);

  const toggleFavorite = (item: FavoriteItem) => {
    return FavoriteStore.toggleFavorite(item);
  };

  const removeFavorite = (id: string) => {
    FavoriteStore.removeFavorite(id);
  };

  const isFavorite = (id: string) => {
    return favoriteItems.some((i) => String(i.id) === String(id));
  };

  return {
    favoriteItems,
    favoriteCount,
    isLoaded,
    toggleFavorite,
    removeFavorite,
    isFavorite,
  };
}

