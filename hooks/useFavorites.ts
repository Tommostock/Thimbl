'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getFavorites,
  addFavorite as addFav,
  removeFavorite as removeFav,
  getFavoritePatterns,
  type FavoritePatternMeta,
} from '@/lib/storage';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritePatterns, setFavoritePatterns] = useState<FavoritePatternMeta[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavorites());
    setFavoritePatterns(getFavoritePatterns());
  }, []);

  const toggleFavorite = useCallback(
    (id: string, meta?: FavoritePatternMeta) => {
      if (favoriteIds.includes(id)) {
        removeFav(id);
        setFavoriteIds((prev) => prev.filter((fid) => fid !== id));
        setFavoritePatterns((prev) => prev.filter((p) => p.id !== id));
      } else {
        addFav(id, meta);
        setFavoriteIds((prev) => [id, ...prev]);
        if (meta) {
          setFavoritePatterns((prev) => [meta, ...prev]);
        }
      }
    },
    [favoriteIds],
  );

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favoriteIds, favoritePatterns, toggleFavorite, isFavorite };
}
