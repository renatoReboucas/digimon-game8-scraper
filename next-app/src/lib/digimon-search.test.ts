import { describe, expect, it } from 'vitest'
import type { Digimon } from '@/types/DigimonTypes'
import { filterDigimons } from './digimon-search'

const digimons: Digimon[] = [
  { id: '1', name: 'Agumon' },
  { id: '2', name: 'Gabumon' },
  { id: '3' },
]

function filters(overrides: Partial<Parameters<typeof filterDigimons>[1]> = {}) {
  return {
    query: '',
    showFavorites: false,
    favoriteIds: new Set<string>(),
    selectedParentId: null,
    ...overrides,
  }
}

describe('filterDigimons', () => {
  it('trims the query and matches names without case sensitivity', () => {
    expect(filterDigimons(digimons, filters({ query: '  AGUMON  ' }))).toEqual([digimons[0]])
  })

  it('keeps the existing empty-query behavior for Digimon without names', () => {
    expect(filterDigimons(digimons, filters({ query: '   ' }))).toEqual(digimons.slice(0, 2))
  })

  it('does not impose a new query length limit', () => {
    expect(filterDigimons(digimons, filters({ query: 'Agumon plus extra text' }))).toEqual([])
    expect(filterDigimons(digimons, filters({ query: 'mon' }))).toEqual(digimons.slice(0, 2))
  })

  it('combines favorites and selected-parent filters with the query', () => {
    expect(filterDigimons(digimons, filters({
      query: 'mon',
      showFavorites: true,
      favoriteIds: new Set(['2', '3']),
      selectedParentId: '2',
    }))).toEqual([digimons[1]])
  })
})