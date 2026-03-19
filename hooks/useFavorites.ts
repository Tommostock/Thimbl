'use client';

import { useState, useCallback, useEffect } from 'react';
import { getFavorites, addFavorite as addFav, removeFavorite as removeFav } from '@/lib/storage';
import { PROJECTS } from '@/lib/data';
import type { Project } from '@/lib/types/database';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavorites());
  }, []);

  const favorites: Project[] = favoriteIds
    .map((id) => PROJECTS.find((p) => p.id === id))
    .filter((p): p is Project => !!p);

  const toggleFavorite = useCallback(
    (id: string) => {
      if (favoriteIds.includes(id)) {
        removeFav(id);
        setFavoriteIds((prev) => prev.filter((fid) => fid !== id));
      } else {
        addFav(id);
        setFavoriteIds((prev) => [id, ...prev]);
      }
    },
    [favoriteIds],
  );

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favorites, favoriteIds, toggleFavorite, isFavorite };
}
