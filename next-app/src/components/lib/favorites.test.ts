// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FAVORITES_STORAGE_KEY, readFavorites, saveFavorites } from './favorites'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('favorites storage', () => {
  it('reads arrays as string IDs and treats missing/non-array data as empty', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '["1",2]')
    expect(readFavorites()).toEqual(new Set(['1', '2']))

    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '{"id":"1"}')
    expect(readFavorites()).toEqual(new Set())

    window.localStorage.removeItem(FAVORITES_STORAGE_KEY)
    expect(readFavorites()).toEqual(new Set())
  })

  it('falls back safely for invalid JSON and blocked storage operations', () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, '{invalid')
    expect(readFavorites()).toEqual(new Set())

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked')
    })
    expect(readFavorites()).toEqual(new Set())

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    expect(() => saveFavorites(new Set(['1']))).not.toThrow()
  })
})