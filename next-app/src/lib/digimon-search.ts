import type { Digimon } from '@/types/DigimonTypes'

export interface DigimonSearchFilters {
  query: string
  showFavorites: boolean
  favoriteIds: ReadonlySet<string>
  selectedParentId: string | null
}

export function filterDigimons(
  digimons: readonly Digimon[],
  filters: DigimonSearchFilters,
): Digimon[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase('pt-BR')

  return digimons.filter((item) => {
    const matchesQuery = item.name?.toLocaleLowerCase('pt-BR').includes(normalizedQuery) ?? false
    const matchesFavorite = !filters.showFavorites || filters.favoriteIds.has(String(item.id))
    const matchesParent = filters.selectedParentId === null
      || String(item.id) === String(filters.selectedParentId)

    return matchesQuery && matchesFavorite && matchesParent
  })
}