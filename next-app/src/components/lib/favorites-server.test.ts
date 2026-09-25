// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { readFavorites, saveFavorites } from './favorites'

describe('favorites storage outside the browser', () => {
  it('returns empty favorites and skips persistence without window', () => {
    vi.stubGlobal('window', undefined)

    expect(readFavorites()).toEqual(new Set())
    expect(() => saveFavorites(new Set(['1']))).not.toThrow()
  })
})