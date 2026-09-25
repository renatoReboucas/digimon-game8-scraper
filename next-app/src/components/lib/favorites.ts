// @ts-nocheck

export const FAVORITES_STORAGE_KEY = 'digimon-atlas:favorites:v1';

export function readFavorites(): Set<string> {
  try {
    const value = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch {
    return new Set();
  }
}

export function saveFavorites(favoriteIds: Set<string>): void {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds]));
  } catch {
    // A interface continua funcional quando o armazenamento estiver bloqueado.
  }
}
