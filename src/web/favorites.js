export const FAVORITES_STORAGE_KEY = 'digimon-atlas:favorites:v1';

export function readFavoriteIds(storage) {
  try {
    const value = JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch {
    return new Set();
  }
}

export function saveFavoriteIds(storage, favoriteIds) {
  try {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds]));
  } catch {
    // A página continua utilizável quando o navegador bloqueia o armazenamento.
  }
}

export function toggleFavorite(favoriteIds, id) {
  const nextFavoriteIds = new Set(favoriteIds);
  const normalizedId = String(id);
  if (nextFavoriteIds.has(normalizedId)) nextFavoriteIds.delete(normalizedId);
  else nextFavoriteIds.add(normalizedId);
  return nextFavoriteIds;
}

export function filterDigimons(digimons, query, showFavorites, favoriteIds) {
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  return digimons.filter((item) => {
    const matchesQuery = item.name?.toLocaleLowerCase('pt-BR').includes(normalizedQuery);
    const isFavorite = favoriteIds.has(String(item.id));
    return matchesQuery && (!showFavorites || isFavorite);
  });
}