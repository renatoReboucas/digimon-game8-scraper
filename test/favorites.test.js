import { describe, expect, it } from 'vitest';
import {
  FAVORITES_STORAGE_KEY,
  filterDigimons,
  readFavoriteIds,
  saveFavoriteIds,
  toggleFavorite
} from '../src/web/favorites.js';

function createStorage(initialValue) {
  const values = new Map(initialValue ? [[FAVORITES_STORAGE_KEY, initialValue]] : []);
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
}

describe('favoritos', () => {
  it('restaura IDs salvos e ignora conteúdo inválido', () => {
    expect(readFavoriteIds(createStorage('["1", 2]'))).toEqual(new Set(['1', '2']));
    expect(readFavoriteIds(createStorage('{"id":"1"}'))).toEqual(new Set());
    expect(readFavoriteIds(createStorage('conteúdo inválido'))).toEqual(new Set());
  });

  it('salva e alterna um favorito', () => {
    const storage = createStorage();
    const favoriteIds = toggleFavorite(new Set(), 42);
    saveFavoriteIds(storage, favoriteIds);

    expect(storage.getItem(FAVORITES_STORAGE_KEY)).toBe('["42"]');
    expect(toggleFavorite(favoriteIds, 42)).toEqual(new Set());
  });

  it('filtra por nome e favoritos ao mesmo tempo', () => {
    const digimons = [{ id: '1', name: 'Agumon' }, { id: '2', name: 'Gabumon' }];

    expect(filterDigimons(digimons, 'mon', false, new Set())).toEqual(digimons);
    expect(filterDigimons(digimons, 'agu', true, new Set(['1']))).toEqual([digimons[0]]);
    expect(filterDigimons(digimons, '', true, new Set(['2']))).toEqual([digimons[1]]);
  });
});